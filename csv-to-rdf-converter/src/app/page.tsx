"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, FileText, Settings, Play, Trash2, Link, Users, Database, Home } from "lucide-react"
import Papa from "papaparse"
import OnePage from "../components/one-page"

interface CSVColumn {
  name: string
  sampleValues: string[]
}

interface PropertyMapping {
  csvColumn: string
  rdfProperties: string[] // Cambiar de rdfProperty a rdfProperties (array)
  type: "literal" | "resource"
  datatype: string
  isMultiValue: boolean
  delimiter: string
  relatedEntityType?: string
  relationshipProperty?: string
}

interface EntityConfig {
  name: string
  csvIdentifierColumn: string
  rdfClass: string
  properties: PropertyMapping[]
  relatedColumns: string[]
}

interface Config {
  baseUri: string
  namespaces: Record<string, string>
  entities: EntityConfig[]
}

const defaultNamespaces = {
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  dc: "http://purl.org/dc/elements/1.1/",
  dcterms: "http://purl.org/dc/terms/",
  foaf: "http://xmlns.com/foaf/0.1/",
  schema: "http://schema.org/",
  bibo: "http://purl.org/ontology/bibo/",
  ex: "http://example.org/ontology/",
}

const commonDataTypes = [
  "xsd:string",
  "xsd:integer",
  "xsd:decimal",
  "xsd:boolean",
  "xsd:date",
  "xsd:dateTime",
  "xsd:gYear",
  "xsd:anyURI",
]

export default function CSVToRDFConverter() {
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvColumns, setCsvColumns] = useState<CSVColumn[]>([])
  const [selectedEntityColumns, setSelectedEntityColumns] = useState<string[]>([])
  const [config, setConfig] = useState<Config>({
    baseUri: "http://universidad.edu.ec/recurso/",
    namespaces: defaultNamespaces,
    entities: [],
  })
  const [currentStep, setCurrentStep] = useState<"upload" | "configure" | "entities" | "relationships" | "generate">(
    "upload",
  )
  const [generatedTTL, setGeneratedTTL] = useState<string>("")
  const [generatedConfig, setGeneratedConfig] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [entityNames, setEntityNames] = useState<Record<string, string>>({})
  const [csvDelimiter, setCsvDelimiter] = useState<string>(",")
  const [/*showDelimiterConfig,*/ setShowDelimiterConfig] = useState<boolean>(false)
  const [showOnePage, setShowOnePage] = useState<boolean>(true)

  // Actualizar configuración en tiempo real
  useEffect(() => {
    const configJson = {
      base_uri: config.baseUri,
      namespaces: config.namespaces,
      entities: config.entities
        .filter((entity) => entity.name && entity.rdfClass && entity.csvIdentifierColumn)
        .map((entity) => ({
          name: entity.name,
          csv_identifier_column: entity.csvIdentifierColumn,
          rdf_class: entity.rdfClass,
          properties: entity.properties
            .filter((prop) => prop.rdfProperties.some((rdfProp) => rdfProp.trim()))
            .map((prop) => ({
              csv_column: prop.csvColumn,
              rdf_properties: prop.rdfProperties.filter((rdfProp) => rdfProp.trim()), // Filtrar propiedades vacías
              type: prop.type,
              datatype: prop.datatype,
              ...(prop.isMultiValue && { split_delimiter: prop.delimiter }),
              ...(prop.type === "resource" && {
                related_entity_type: prop.relatedEntityType,
                relationship_property: prop.relationshipProperty,
              }),
            })),
        })),
    }

    setGeneratedConfig(JSON.stringify(configJson, null, 2))
  }, [config])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    // Leer el archivo como texto primero para detectar delimitador
    const reader = new FileReader()
    reader.onload = (e) => {
      const csvText = e.target?.result as string
      const detectedDelimiter = detectDelimiter(csvText)
      setCsvDelimiter(detectedDelimiter)

      // Mostrar configuración de delimitador si no es coma
      /*if (detectedDelimiter !== ",") {
        setShowDelimiterConfig(true)
      }*/

      // Procesar con el delimitador detectado
      parseCSVWithDelimiter(csvText, detectedDelimiter)
    }
    reader.readAsText(file)
  }

  const inferDataType = (sampleValues: string[]): string => {
    if (sampleValues.length === 0) return "xsd:string"

    const firstValue = sampleValues[0]?.toString().trim()
    if (!firstValue) return "xsd:string"

    if (/^\d+$/.test(firstValue)) return "xsd:integer"
    if (/^\d*\.\d+$/.test(firstValue)) return "xsd:decimal"
    if (/^\d{4}$/.test(firstValue)) return "xsd:gYear"
    if (/^\d{4}-\d{2}-\d{2}/.test(firstValue)) return "xsd:date"
    if (/^https?:\/\//.test(firstValue)) return "xsd:anyURI"
    if (/^(true|false|yes|no|1|0)$/i.test(firstValue)) return "xsd:boolean"

    return "xsd:string"
  }

  const detectDelimiter = (csvText: string): string => {
    const sample = csvText.split("\n").slice(0, 5).join("\n") // Usar las primeras 5 líneas
    const delimiters = [",", ";", "\t", "|"]
    let bestDelimiter = ","
    let maxColumns = 0

    delimiters.forEach((delimiter) => {
      const lines = sample.split("\n").filter((line) => line.trim())
      if (lines.length < 2) return

      const columnCounts = lines.map((line) => line.split(delimiter).length)
      const avgColumns = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length
      const consistency = columnCounts.every((count) => Math.abs(count - avgColumns) <= 1)

      if (consistency && avgColumns > maxColumns) {
        maxColumns = avgColumns
        bestDelimiter = delimiter
      }
    })

    return bestDelimiter
  }

  const parseCSVWithDelimiter = (csvText: string, delimiter: string) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      delimiter: delimiter,
      complete: (results) => {
        const data = results.data as any[]

        const filteredData = data.filter((row) =>
          Object.values(row).some((value) => value && value.toString().trim() !== ""),
        )

        setCsvData(filteredData)

        if (filteredData.length === 0) {
          alert("El archivo CSV está vacío o no contiene datos válidos.")
          return
        }

        const actualColumns = Object.keys(filteredData[0] || {})
        const columns: CSVColumn[] = actualColumns.map((columnName) => ({
          name: columnName,
          sampleValues: filteredData
            .slice(0, 3)
            .map((row) => row[columnName])
            .filter((val) => val && val.toString().trim() !== "")
            .slice(0, 3),
        }))

        setCsvColumns(columns)

        // Inicializar solo la entidad principal
        setConfig((prev) => ({
          ...prev,
          entities: [
            {
              name: "MainEntity",
              csvIdentifierColumn: "",
              rdfClass: "",
              relatedColumns: [],
              properties: columns.map((col) => ({
                csvColumn: col.name,
                rdfProperties: [""], // Inicializar con un array con un string vacío
                type: "literal" as const,
                datatype: inferDataType(col.sampleValues),
                isMultiValue: false,
                delimiter: ";",
              })),
            },
          ],
        }))

        setSelectedEntityColumns([])
        setCurrentStep("configure")
      },
      error: (error: any) => {
        console.error("Error parsing CSV:", error)
        alert("Error al procesar el archivo CSV. Verifica que sea un archivo CSV válido.")
      },
    })
  }

  const handleDelimiterChange = (newDelimiter: string) => {
    setCsvDelimiter(newDelimiter)
    if (fileName) {
      // Re-procesar el archivo con el nuevo delimitador
      const fileInput = document.getElementById("csv-upload") as HTMLInputElement
      const file = fileInput?.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const csvText = e.target?.result as string
          parseCSVWithDelimiter(csvText, newDelimiter)
        }
        reader.readAsText(file)
      }
    }
  }

  const updateEntityProperty = (
    entityIndex: number,
    propertyIndex: number,
    field: keyof PropertyMapping,
    value: any,
  ) => {
    setConfig((prev) => ({
      ...prev,
      entities: prev.entities.map((entity, eIdx) =>
        eIdx === entityIndex
          ? {
              ...entity,
              properties: entity.properties.map((prop, pIdx) =>
                pIdx === propertyIndex ? { ...prop, [field]: value } : prop,
              ),
            }
          : entity,
      ),
    }))
  }

  const updateEntity = (entityIndex: number, field: keyof EntityConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      entities: prev.entities.map((entity, idx) => (idx === entityIndex ? { ...entity, [field]: value } : entity)),
    }))
  }

  const handleEntityColumnSelection = (columnName: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedEntityColumns((prev) => [...prev, columnName])
    } else {
      setSelectedEntityColumns((prev) => prev.filter((col) => col !== columnName))
    }
  }

  const createEntitiesFromSelection = () => {
    const newEntities: EntityConfig[] = [config.entities[0]] // Mantiene la entidad principal.

    // Solo crear entidades adicionales si hay columnas seleccionadas
    if (selectedEntityColumns.length > 0) {
      selectedEntityColumns.forEach((columnName) => {
        const column = csvColumns.find((col) => col.name === columnName)
        if (!column) return

        const entityName = entityNames[columnName] || columnName.replace(/[^a-zA-Z0-9]/g, "")

        const newEntity: EntityConfig = {
          name: entityName,
          csvIdentifierColumn: columnName,
          rdfClass: "",
          relatedColumns: [],
          properties: [
            {
              csvColumn: columnName,
              rdfProperties: [""],
              type: "literal",
              datatype: inferDataType([]),
              isMultiValue: false,
              delimiter: ";",
            },
          ],
        }

        newEntities.push(newEntity)
      })
    }

    setConfig((prev) => ({ ...prev, entities: newEntities }))
    setCurrentStep("relationships")
  }

  const handleRelatedColumnToggle = (entityIndex: number, columnName: string, isSelected: boolean) => {
    setConfig((prev) => ({
      ...prev,
      entities: prev.entities.map((entity, idx) => {
        if (idx !== entityIndex) return entity

        const newRelatedColumns = isSelected
          ? [...entity.relatedColumns, columnName]
          : entity.relatedColumns.filter((col) => col !== columnName)

        // Agregar/quitar propiedades según las columnas relacionadas
        let newProperties = [...entity.properties]

        if (isSelected) {
          // Agregar propiedad si no existe
          const column = csvColumns.find((col) => col.name === columnName)
          if (column && !newProperties.some((prop) => prop.csvColumn === columnName)) {
            newProperties.push({
              csvColumn: columnName,
              rdfProperties: [""],
              type: "literal",
              datatype: inferDataType(column.sampleValues),
              isMultiValue: false,
              delimiter: ";",
            })
          }
        } else {
          // Quitar propiedad si existe
          newProperties = newProperties.filter((prop) => prop.csvColumn !== columnName)
        }

        return {
          ...entity,
          relatedColumns: newRelatedColumns,
          properties: newProperties,
        }
      }),
    }))
  }

  const updateMainEntityRelationships = () => {
    // Actualizar la entidad principal para que tenga relaciones con las entidades creadas
    setConfig((prev) => ({
      ...prev,
      entities: prev.entities.map((entity, idx) => {
        if (idx !== 0) return entity // Solo actualizar entidad principal

        const updatedProperties = entity.properties.map((prop) => {
          // Verificar si esta columna es una entidad
          const isEntityColumn = selectedEntityColumns.includes(prop.csvColumn)
          if (isEntityColumn) {
            const relatedEntity = prev.entities.find((e) => e.csvIdentifierColumn === prop.csvColumn)
            if (relatedEntity) {
              return {
                ...prop,
                type: "resource" as const,
                relatedEntityType: relatedEntity.name,
                relationshipProperty: prop.rdfProperties[0] || `ex:relatedTo${relatedEntity.name}`,
              }
            }
          }
          return prop
        })

        return { ...entity, properties: updatedProperties }
      }),
    }))
  }

  const updateNamespace = (prefix: string, uri: string) => {
    setConfig((prev) => ({
      ...prev,
      namespaces: {
        ...prev.namespaces,
        [prefix]: uri,
      },
    }))
  }

  const addNamespace = () => {
    const prefix = prompt("Ingresa el prefijo del namespace (ej: bibo):")
    const uri = prompt("Ingresa la URI del namespace:")
    if (prefix && uri) {
      updateNamespace(prefix, uri)
    }
  }

  const removeNamespace = (prefix: string) => {
    if (["rdf", "rdfs", "xsd"].includes(prefix)) {
      alert("No se pueden eliminar los namespaces básicos (rdf, rdfs, xsd)")
      return
    }

    setConfig((prev) => {
      const newNamespaces = { ...prev.namespaces }
      delete newNamespaces[prefix]
      return { ...prev, namespaces: newNamespaces }
    })
  }

  const cleanUriSegment = (text: string): string => {
    if (!text) return ""
    return text
      .toString()
      .trim()
      .replace(/[^\w\s-_.]/g, "")
      .replace(/\s+/g, "-")
      .replace(/_{2,}/g, "_")
      .replace(/-{2,}/g, "-")
      .toLowerCase()
  }

  const validateConfiguration = (): string[] => {
    const errors: string[] = []

    config.entities.forEach((entity, idx) => {
      if (!entity.name.trim()) {
        errors.push(`Entidad ${idx + 1}: El nombre es requerido`)
      }
      if (!entity.rdfClass.trim()) {
        errors.push(`Entidad ${entity.name || idx + 1}: La clase RDF es requerida`)
      }
      if (!entity.csvIdentifierColumn) {
        errors.push(`Entidad ${entity.name || idx + 1}: Debe seleccionar una columna identificadora`)
      }
    })

    return errors
  }

  const addRdfProperty = (entityIndex: number, propertyIndex: number) => {
    setConfig((prev) => ({
      ...prev,
      entities: prev.entities.map((entity, eIdx) =>
        eIdx === entityIndex
          ? {
              ...entity,
              properties: entity.properties.map((prop, pIdx) =>
                pIdx === propertyIndex ? { ...prop, rdfProperties: [...prop.rdfProperties, ""] } : prop,
              ),
            }
          : entity,
      ),
    }))
  }

  const removeRdfProperty = (entityIndex: number, propertyIndex: number, rdfPropIndex: number) => {
    setConfig((prev) => ({
      ...prev,
      entities: prev.entities.map((entity, eIdx) =>
        eIdx === entityIndex
          ? {
              ...entity,
              properties: entity.properties.map((prop, pIdx) =>
                pIdx === propertyIndex
                  ? {
                      ...prop,
                      rdfProperties: prop.rdfProperties.filter((_, idx) => idx !== rdfPropIndex),
                    }
                  : prop,
              ),
            }
          : entity,
      ),
    }))
  }

  const updateRdfProperty = (entityIndex: number, propertyIndex: number, rdfPropIndex: number, value: string) => {
    setConfig((prev) => ({
      ...prev,
      entities: prev.entities.map((entity, eIdx) =>
        eIdx === entityIndex
          ? {
              ...entity,
              properties: entity.properties.map((prop, pIdx) =>
                pIdx === propertyIndex
                  ? {
                      ...prop,
                      rdfProperties: prop.rdfProperties.map((rdfProp, idx) => (idx === rdfPropIndex ? value : rdfProp)),
                    }
                  : prop,
              ),
            }
          : entity,
      ),
    }))
  }

  const generateTTL = () => {
    const errors = validateConfiguration()
    if (errors.length > 0) {
      alert("Errores de configuración:\n" + errors.join("\n"))
      return
    }

    updateMainEntityRelationships()

    let ttl = ""

    // Add namespace prefixes
    Object.entries(config.namespaces).forEach(([prefix, uri]) => {
      ttl += `@prefix ${prefix}: <${uri}> .\n`
    })
    ttl += `@base <${config.baseUri}> .\n\n`

    // Crear un mapa de recursos creados para evitar duplicados
    const createdResources = new Map<string, Set<string>>()

    // Procesar cada entidad
    config.entities.forEach((entity) => {
      if (!entity.name || !entity.rdfClass || !entity.csvIdentifierColumn) return

      createdResources.set(entity.name, new Set())

      csvData.forEach((row, rowIndex) => {
        const identifier = row[entity.csvIdentifierColumn]
        if (!identifier || identifier.toString().trim() === "") return

        // Para entidades con multivalores, procesar cada valor por separado
        const identifierValues = entity.properties.some(
          (p) => p.csvColumn === entity.csvIdentifierColumn && p.isMultiValue,
        )
          ? identifier
              .toString()
              .split(";")
              .map((v: string) => v.trim())
              .filter((v: string) => v)
          : [identifier.toString()]

        identifierValues.forEach((idValue: string) => {
          const cleanId = cleanUriSegment(idValue)
          if (!cleanId) return

          const resourceKey = `${entity.name}-${cleanId}`
          if (createdResources.get(entity.name)?.has(resourceKey)) return
          createdResources.get(entity.name)?.add(resourceKey)

          const resourceUri = `<${entity.name.toLowerCase()}/${cleanId}>`

          // Add type declaration
          ttl += `${resourceUri} a ${entity.rdfClass}`

          // Add properties
          const propertyTriples: string[] = []

          entity.properties.forEach((prop) => {
            const validRdfProperties = prop.rdfProperties.filter((rdfProp) => rdfProp.trim())
            if (validRdfProperties.length === 0) return

            const value = row[prop.csvColumn]
            if (!value || value.toString().trim() === "") return

            validRdfProperties.forEach((rdfProperty) => {
              if (prop.type === "literal") {
                if (prop.isMultiValue && prop.delimiter) {
                  const values = value
                    .toString()
                    .split(prop.delimiter)
                    .map((v: string) => v.trim())
                    .filter((v: string) => v !== "")

                  values.forEach((v: string) => {
                    const escapedValue = v
                      .replace(/\\/g, "\\\\")
                      .replace(/"/g, '\\"')
                      .replace(/\n/g, "\\n")
                      .replace(/\r/g, "\\r")
                      .replace(/\t/g, "\\t")

                    const literal =
                      prop.datatype === "xsd:string" ? `"${escapedValue}"` : `"${escapedValue}"^^${prop.datatype}`
                    propertyTriples.push(`    ${rdfProperty} ${literal}`)
                  })
                } else {
                  const escapedValue = value
                    .toString()
                    .replace(/\\/g, "\\\\")
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, "\\n")
                    .replace(/\r/g, "\\r")
                    .replace(/\t/g, "\\t")

                  const literal =
                    prop.datatype === "xsd:string" ? `"${escapedValue}"` : `"${escapedValue}"^^${prop.datatype}`
                  propertyTriples.push(`    ${rdfProperty} ${literal}`)
                }
              } else if (prop.type === "resource" && prop.relatedEntityType && prop.relationshipProperty) {
                // Para recursos, usar solo la primera propiedad RDF válida como relationshipProperty
                if (rdfProperty === validRdfProperties[0]) {
                  if (prop.isMultiValue && prop.delimiter) {
                    const values = value
                      .toString()
                      .split(prop.delimiter)
                      .map((v: string) => v.trim())
                      .filter((v: string) => v !== "")

                    values.forEach((v: string) => {
                      const relatedCleanId = cleanUriSegment(v)
                      if (relatedCleanId) {
                        const relatedResourceUri = `<${prop.relatedEntityType?.toLowerCase()}/${relatedCleanId}>`
                        propertyTriples.push(`    ${prop.relationshipProperty} ${relatedResourceUri}`)
                      }
                    })
                  } else {
                    const relatedCleanId = cleanUriSegment(value.toString())
                    if (relatedCleanId) {
                      const relatedResourceUri = `<${prop.relatedEntityType?.toLowerCase()}/${relatedCleanId}>`
                      propertyTriples.push(`    ${prop.relationshipProperty} ${relatedResourceUri}`)
                    }
                  }
                }
              }
            })
          })

          if (propertyTriples.length > 0) {
            ttl += " ;\n" + propertyTriples.join(" ;\n") + " .\n\n"
          } else {
            ttl += " .\n\n"
          }
        })
      })
    })

    setGeneratedTTL(ttl)
    setCurrentStep("generate")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadTTL = () => {
    const filename = fileName ? fileName.replace(/\.[^/.]+$/, ".ttl") : "output.ttl"
    downloadFile(generatedTTL, filename, "text/turtle")
  }

  const downloadConfig = () => {
    downloadFile(generatedConfig, "mapping_config.json", "application/json")
  }

  const resetAll = () => {
    setCsvData([])
    setCsvColumns([])
    setSelectedEntityColumns([])
    setEntityNames({})
    setCsvDelimiter(",")
    /*setShowDelimiterConfig(false)*/
    setConfig({
      baseUri: "http://universidad.edu.ec/recurso/",
      namespaces: defaultNamespaces,
      entities: [],
    })
    setGeneratedTTL("")
    setGeneratedConfig("")
    setCurrentStep("upload")
    setFileName("")
  }

  if (showOnePage) {
    return <OnePage onStartConverter={() => setShowOnePage(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      <div className="container mx-auto p-6 max-w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                CSV to RDF Converter
              </h1>
              <p className="text-purple-700">
                Sube tu archivo CSV, configura propiedades, selecciona entidades y define relaciones
              </p>
            </div>
            <Button
              onClick={() => setShowOnePage(true)}
              variant="outline"
              className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </div>
          {fileName && (
            <div className="flex items-center justify-between text-sm text-pink-600 mt-2">
              <p>
                Archivo cargado: <strong>{fileName}</strong>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-purple-700">Delimitador:</span>
                <Select value={csvDelimiter} onValueChange={handleDelimiterChange}>
                  <SelectTrigger className="w-32 h-8 text-xs border-pink-300 focus:border-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-pink-200">
                    <SelectItem value="," className="hover:bg-pink-50 text-xs">
                      Coma (,)
                    </SelectItem>
                    <SelectItem value=";" className="hover:bg-pink-50 text-xs">
                      Punto y coma (;)
                    </SelectItem>
                    <SelectItem value="\t" className="hover:bg-pink-50 text-xs">
                      Tabulación
                    </SelectItem>
                    <SelectItem value="|" className="hover:bg-pink-50 text-xs">
                      Barra vertical (|)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
              <TabsList className="grid w-full grid-cols-5 bg-white border-2 border-pink-200">
                <TabsTrigger
                  value="upload"
                  className="flex items-center gap-1 data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700"
                >
                  <Upload className="w-3 h-3" />
                  Subir
                </TabsTrigger>
                <TabsTrigger
                  value="configure"
                  disabled={csvColumns.length === 0}
                  className="flex items-center gap-1 data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700"
                >
                  <Settings className="w-3 h-3" />
                  Propiedades
                </TabsTrigger>
                <TabsTrigger
                  value="entities"
                  disabled={csvColumns.length === 0}
                  className="flex items-center gap-1 data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700"
                >
                  <Database className="w-3 h-3" />
                  Entidades
                </TabsTrigger>
                <TabsTrigger
                  value="relationships"
                  disabled={csvColumns.length === 0}
                  className="flex items-center gap-1 data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700"
                >
                  <Link className="w-3 h-3" />
                  Relaciones
                </TabsTrigger>
                <TabsTrigger
                  value="generate"
                  disabled={!generatedTTL}
                  className="flex items-center gap-1 data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700"
                >
                  <FileText className="w-3 h-3" />
                  Generar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                <Card className="border-2 border-pink-200 bg-white shadow-lg">
                  <CardHeader className="bg-white">
                    <CardTitle className="text-purple-800">Subir Archivo CSV</CardTitle>
                    <CardDescription className="text-purple-600">
                      Selecciona tu archivo CSV para comenzar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="border-2 border-dashed border-pink-300 rounded-lg p-8 text-center bg-pink-50">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-pink-500" />
                      <div className="flex justify-center items-center">
                        <Label htmlFor="csv-upload" className="cursor-pointer">
                          <span className="text-lg font-medium text-purple-700">Elegir archivo CSV</span>
                          <Input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </Label>
                      </div>
                      <p className="text-sm text-purple-600 mt-2">Soporta archivos CSV con encabezados</p>
                    </div>

                    {csvColumns.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-purple-800">
                            Columnas Detectadas ({csvColumns.length})
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetAll}
                            className="border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Limpiar Todo
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {csvColumns.map((column, index) => (
                            <Card key={index} className="border-purple-200 bg-gradient-to-br from-pink-50 to-purple-50">
                              <CardContent className="p-4">
                                <h4 className="font-medium text-purple-700">{column.name}</h4>
                                <p className="text-sm text-purple-600">Columna detectada</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <Button
                          onClick={() => setCurrentStep("configure")}
                          className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                        >
                          Configurar Propiedades
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configure" className="space-y-6">
                <Card className="border-2 border-pink-200 bg-white shadow-lg">
                  <CardHeader className="bg-white">
                    <CardTitle className="text-purple-800">Configuración de Entidad Principal</CardTitle>
                    <CardDescription className="text-purple-600">
                      Configura la entidad principal de tu dataset
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entity-name" className="text-purple-700">
                          Nombre de Entidad
                        </Label>
                        <Input
                          id="entity-name"
                          value={config.entities[0]?.name || ""}
                          onChange={(e) => updateEntity(0, "name", e.target.value)}
                          placeholder="ej: Publication, Person, Product"
                          className="border-pink-300 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rdf-class" className="text-purple-700">
                          Clase RDF
                        </Label>
                        <Input
                          id="rdf-class"
                          value={config.entities[0]?.rdfClass || ""}
                          onChange={(e) => updateEntity(0, "rdfClass", e.target.value)}
                          placeholder="ej: bibo:AcademicArticle, foaf:Person"
                          className="border-pink-300 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="identifier-column" className="text-purple-700">
                        Columna Identificadora
                      </Label>
                      <Select
                        value={config.entities[0]?.csvIdentifierColumn || ""}
                        onValueChange={(value) => updateEntity(0, "csvIdentifierColumn", value)}
                      >
                        <SelectTrigger className="border-pink-300 focus:border-purple-500">
                          <SelectValue placeholder="Selecciona la columna que identifica únicamente cada fila" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-pink-200">
                          {csvColumns.map((col) => (
                            <SelectItem key={col.name} value={col.name} className="hover:bg-pink-50">
                              {col.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 bg-white shadow-lg">
                  <CardHeader className="bg-white">
                    <CardTitle className="text-purple-800">Propiedades de la Entidad Principal</CardTitle>
                    <CardDescription className="text-purple-600">
                      Configura las propiedades básicas (literales)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {config.entities[0]?.properties.map((prop, propIndex) => (
                        <div
                          key={propIndex}
                          className="border-2 border-pink-200 rounded-lg p-4 space-y-3 bg-gradient-to-r from-pink-50 to-purple-50"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-purple-700">{prop.csvColumn}</h4>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`multi-${propIndex}`}
                                checked={prop.isMultiValue}
                                onCheckedChange={(checked) =>
                                  updateEntityProperty(0, propIndex, "isMultiValue", checked)
                                }
                                className="border-pink-400 data-[state=checked]:bg-pink-500"
                              />
                              <Label htmlFor={`multi-${propIndex}`} className="text-sm text-purple-600">
                                Multivalor
                              </Label>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm text-purple-700">Tipo de Dato</Label>
                              <Select
                                value={prop.datatype}
                                onValueChange={(value) => updateEntityProperty(0, propIndex, "datatype", value)}
                              >
                                <SelectTrigger className="text-sm border-pink-300 focus:border-purple-500">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-pink-200">
                                  {commonDataTypes.map((type) => (
                                    <SelectItem key={type} value={type} className="hover:bg-pink-50">
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm text-purple-700">Propiedades RDF</Label>
                            <div className="space-y-2">
                              {prop.rdfProperties.map((rdfProp, rdfPropIndex) => (
                                <div key={rdfPropIndex} className="flex items-center gap-2">
                                  <Input
                                    value={rdfProp}
                                    onChange={(e) => updateRdfProperty(0, propIndex, rdfPropIndex, e.target.value)}
                                    placeholder="ej: dc:title, schema:title"
                                    className="text-sm border-pink-300 focus:border-purple-500 flex-1"
                                  />
                                  {prop.rdfProperties.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeRdfProperty(0, propIndex, rdfPropIndex)}
                                      className="p-1 border-pink-300 text-pink-600 hover:bg-pink-50"
                                    >
                                      ×
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addRdfProperty(0, propIndex)}
                                className="border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
                              >
                                + Agregar Propiedad RDF
                              </Button>
                            </div>
                          </div>

                          {prop.isMultiValue && (
                            <div>
                              <Label className="text-sm text-purple-700">Delimitador</Label>
                              <Input
                                value={prop.delimiter}
                                onChange={(e) => updateEntityProperty(0, propIndex, "delimiter", e.target.value)}
                                placeholder="ej: ; o , o |"
                                className="text-sm border-pink-300 focus:border-purple-500"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={() => setCurrentStep("entities")}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Seleccionar Entidades
                </Button>
              </TabsContent>

              <TabsContent value="entities" className="space-y-6">
                <Card className="border-2 border-pink-200 bg-white shadow-lg">
                  <CardHeader className="bg-white">
                    <CardTitle className="text-purple-800">Seleccionar Columnas que son Entidades</CardTitle>
                    <CardDescription className="text-purple-600">
                      Marca las columnas que representan entidades separadas y asígnales un nombre
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                      {csvColumns.map((column) => (
                        <div
                          key={column.name}
                          className="border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <Checkbox
                              id={`entity-${column.name}`}
                              checked={selectedEntityColumns.includes(column.name)}
                              onCheckedChange={(checked) => handleEntityColumnSelection(column.name, !!checked)}
                              className="border-pink-400 data-[state=checked]:bg-pink-500"
                            />
                            <Label
                              htmlFor={`entity-${column.name}`}
                              className="font-medium text-purple-700 cursor-pointer flex-1"
                            >
                              {column.name}
                            </Label>
                          </div>

                          {selectedEntityColumns.includes(column.name) && (
                            <div className="ml-6 mt-3 p-3 bg-pink-100 rounded-lg border border-pink-300">
                              <Label className="text-sm font-medium text-pink-800">Nombre de la Entidad:</Label>
                              <Input
                                value={entityNames[column.name] || column.name.replace(/[^a-zA-Z0-9]/g, "")}
                                onChange={(e) => setEntityNames((prev) => ({ ...prev, [column.name]: e.target.value }))}
                                placeholder={`ej: Journal (para columna "${column.name}")`}
                                className="mt-1 text-sm border-pink-300 focus:border-purple-500"
                              />
                              <p className="text-xs text-pink-600 mt-1">
                                Columna CSV: <strong>{column.name}</strong> → Entidad:{" "}
                                <strong>{entityNames[column.name] || column.name.replace(/[^a-zA-Z0-9]/g, "")}</strong>
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {selectedEntityColumns.length > 0 && (
                      <div className="mt-6 p-4 bg-purple-100 rounded-lg border-2 border-purple-300">
                        <h4 className="font-medium text-purple-800 mb-2">Entidades Seleccionadas:</h4>
                        <div className="space-y-1">
                          {selectedEntityColumns.map((col) => (
                            <div key={col} className="text-sm">
                              <span className="font-medium text-purple-700">
                                {entityNames[col] || col.replace(/[^a-zA-Z0-9]/g, "")}
                              </span>
                              <span className="text-purple-600 ml-2">(columna: {col})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={createEntitiesFromSelection}
                    disabled={selectedEntityColumns.length === 0}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Configurar Relaciones ({selectedEntityColumns.length} entidades)
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("relationships")}
                    variant="outline"
                    className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Continuar sin Entidades Separadas
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="relationships" className="space-y-6">
                <Card className="border-2 border-pink-200 bg-white shadow-lg">
                  <CardHeader className="bg-white">
                    <CardTitle className="text-purple-800">Configurar Entidades y Relaciones</CardTitle>
                    <CardDescription className="text-purple-600">
                      {config.entities.length === 1
                        ? "Configura las propiedades de tu entidad principal."
                        : "Define las propiedades y relaciones para cada entidad."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {config.entities.length === 1 && (
                      <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
                        <p className="text-purple-800 text-sm">
                          <strong>Modo Simple:</strong> Solo trabajarás con la entidad principal. Todas las propiedades
                          serán literales (texto, números, fechas).
                        </p>
                      </div>
                    )}

                    <div className="space-y-6">
                      {config.entities.slice(1).map((entity, entityIndex) => {
                        const actualEntityIndex = entityIndex + 1
                        const availableColumns = csvColumns.filter(
                          (col) => col.name !== entity.csvIdentifierColumn && !selectedEntityColumns.includes(col.name),
                        )

                        return (
                          <Card
                            key={actualEntityIndex}
                            className="border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50"
                          >
                            <CardHeader className="bg-white">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-600" />
                                <span className="text-purple-800">Entidad: {entity.name}</span>
                              </CardTitle>
                              <CardDescription className="text-purple-700">
                                Columna principal: <strong>{entity.csvIdentifierColumn}</strong>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm text-purple-700">Nombre de Entidad</Label>
                                  <Input
                                    value={entity.name}
                                    onChange={(e) => updateEntity(actualEntityIndex, "name", e.target.value)}
                                    className="text-sm border-pink-300 focus:border-purple-500"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm text-purple-700">Clase RDF</Label>
                                  <Input
                                    value={entity.rdfClass}
                                    onChange={(e) => updateEntity(actualEntityIndex, "rdfClass", e.target.value)}
                                    placeholder="ej: foaf:Person, bibo:Journal"
                                    className="text-sm border-pink-300 focus:border-purple-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium mb-2 block text-purple-700">
                                  Columnas Relacionadas con {entity.name}:
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                  {availableColumns.map((column) => (
                                    <div key={column.name} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`rel-${actualEntityIndex}-${column.name}`}
                                        checked={entity.relatedColumns.includes(column.name)}
                                        onCheckedChange={(checked) =>
                                          handleRelatedColumnToggle(actualEntityIndex, column.name, !!checked)
                                        }
                                        className="border-pink-400 data-[state=checked]:bg-pink-500"
                                      />
                                      <Label
                                        htmlFor={`rel-${actualEntityIndex}-${column.name}`}
                                        className="text-sm cursor-pointer text-purple-700"
                                      >
                                        {column.name}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {entity.relatedColumns.length > 0 && (
                                <div className="mt-4 p-3 bg-pink-100 rounded border border-pink-300">
                                  <p className="text-sm text-pink-800 font-medium">
                                    Columnas relacionadas: {entity.relatedColumns.join(", ")}
                                  </p>
                                </div>
                              )}

                              {/* Configurar propiedades de la entidad */}
                              <div>
                                <Label className="text-sm font-medium text-purple-700">
                                  Propiedades de {entity.name}:
                                </Label>
                                <div className="space-y-3 mt-2">
                                  {entity.properties.map((prop, propIndex) => (
                                    <div
                                      key={propIndex}
                                      className="p-3 border-2 border-purple-200 rounded bg-white space-y-2"
                                    >
                                      <span className="text-sm font-medium text-purple-600 block">
                                        {prop.csvColumn}
                                      </span>
                                      <div className="space-y-2">
                                        {prop.rdfProperties.map((rdfProp, rdfPropIndex) => (
                                          <div key={rdfPropIndex} className="flex items-center gap-2">
                                            <Input
                                              value={rdfProp}
                                              onChange={(e) =>
                                                updateRdfProperty(
                                                  actualEntityIndex,
                                                  propIndex,
                                                  rdfPropIndex,
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Propiedad RDF"
                                              className="text-sm flex-1 border-pink-300 focus:border-purple-500"
                                            />
                                            {prop.rdfProperties.length > 1 && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  removeRdfProperty(actualEntityIndex, propIndex, rdfPropIndex)
                                                }
                                                className="p-1 border-pink-300 text-pink-600 hover:bg-pink-50"
                                              >
                                                ×
                                              </Button>
                                            )}
                                          </div>
                                        ))}
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => addRdfProperty(actualEntityIndex, propIndex)}
                                          className="border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent text-xs"
                                        >
                                          + Agregar Propiedad RDF
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={generateTTL}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Generar RDF
                </Button>
              </TabsContent>

              <TabsContent value="generate" className="space-y-6">
                <Card className="border-2 border-pink-200 bg-white shadow-lg">
                  <CardHeader className="bg-white">
                    <CardTitle className="flex items-center justify-between text-purple-800">
                      RDF Generado (Formato Turtle)
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep("relationships")}
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Editar Relaciones
                        </Button>
                        <Button
                          onClick={downloadTTL}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar TTL
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                      Vista previa y descarga de tus datos RDF generados
                      {csvData.length > 0 && ` (${csvData.length} registros procesados)`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Textarea
                      value={generatedTTL}
                      readOnly
                      className="font-mono text-sm min-h-96 resize-none border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50"
                      placeholder="El TTL generado aparecerá aquí..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Panel lateral con configuración en tiempo real */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-2 border-purple-200 bg-white shadow-lg">
              <CardHeader className="bg-white">
                <CardTitle className="flex items-center justify-between text-lg text-purple-800">
                  Configuración JSON
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadConfig}
                    className="border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </CardTitle>
                <CardDescription className="text-purple-600">Vista previa de tu configuración</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="base-uri-sidebar" className="text-purple-700">
                      URI Base
                    </Label>
                    <Input
                      id="base-uri-sidebar"
                      value={config.baseUri}
                      onChange={(e) => setConfig((prev) => ({ ...prev, baseUri: e.target.value }))}
                      placeholder="http://universidad.edu.ec/recurso/"
                      className="text-sm border-pink-300 focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center justify-between text-purple-700">
                      Namespaces
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addNamespace}
                        className="border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
                      >
                        +
                      </Button>
                    </Label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {Object.entries(config.namespaces).map(([prefix, uri]) => (
                        <div key={prefix} className="flex items-center gap-1">
                          <Input
                            value={prefix}
                            onChange={(e) => {
                              const newPrefix = e.target.value
                              const newNamespaces = { ...config.namespaces }
                              delete newNamespaces[prefix]
                              newNamespaces[newPrefix] = uri
                              setConfig((prev) => ({ ...prev, namespaces: newNamespaces }))
                            }}
                            className="text-xs w-16 border-pink-300 focus:border-purple-500"
                          />
                          <Input
                            value={uri}
                            onChange={(e) => updateNamespace(prefix, e.target.value)}
                            className="text-xs flex-1 border-pink-300 focus:border-purple-500"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeNamespace(prefix)}
                            disabled={["rdf", "rdfs", "xsd"].includes(prefix)}
                            className="p-1 border-pink-300 text-pink-600 hover:bg-pink-50"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-purple-700">Configuración Completa</Label>
                    <Textarea
                      value={generatedConfig}
                      readOnly
                      className="font-mono text-xs min-h-96 resize-none mt-2 border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50"
                      placeholder="La configuración aparecerá aquí en tiempo real..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

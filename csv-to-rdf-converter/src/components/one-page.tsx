"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Upload,
  Settings,
  Database,
  Link,
  FileText,
  ArrowRight,
  Globe,
  Zap,
  Shield,
  Code,
  Layers,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Star,
} from "lucide-react"

interface OnePageProps {
  onStartConverter: () => void
}

export default function OnePage({ onStartConverter }: OnePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Título principal */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Transformando Datos: CSV a RDF
          </h1>
          <p className="text-2xl text-purple-700 max-w-4xl mx-auto mb-8 leading-relaxed">
            Descubre cómo nuestra herramienta convierte datos tabulares simples en un conocimiento estructurado y
            enlazado para la Web Semántica de manera intuitiva y profesional.
          </p>
          <Button
            onClick={onStartConverter}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xl px-12 py-4 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <ArrowRight className="w-6 h-6 mr-3" />
            Comenzar Conversión
          </Button>
        </header>

        {/* Sección: ¿Qué es RDF y por qué es crucial? */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center text-purple-800 mb-12">1. ¿Qué es RDF y por qué es crucial?</h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-pink-200">
              <h3 className="text-3xl font-semibold text-purple-800 mb-6 flex items-center">
                <Globe className="w-8 h-8 mr-3 text-pink-600" />
                RDF: Triples y Semántica
              </h3>
              <p className="text-lg text-purple-700 mb-6 leading-relaxed">
                RDF (Resource Description Framework) es un estándar del W3C que representa información usando triples:
                <span className="font-bold italic text-pink-600 text-xl"> Sujeto - Predicado - Objeto</span>. Es como
                construir frases simples que describen relaciones y atributos de manera que las máquinas puedan
                entender.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-pink-600 text-lg">Interoperables:</strong>
                    <p className="text-purple-700">
                      Los datos son fáciles de combinar y entender entre diferentes sistemas, creando un ecosistema de
                      información conectada.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-pink-600 text-lg">Semánticos:</strong>
                    <p className="text-purple-700">
                      El significado de los datos es explícito, lo que permite a las máquinas interpretarlos y razonar
                      sobre ellos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-pink-600 text-lg">Enlazados:</strong>
                    <p className="text-purple-700">
                      Los datos se conectan a otros en la web, creando una vasta red de conocimiento interconectado y
                      reutilizable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              {/* Representación visual de un triple RDF mejorada */}
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl text-white text-center shadow-xl transform hover:scale-105 transition-all duration-300">
                    <span className="font-bold text-xl">Sujeto</span>
                    <span className="text-sm mt-2 bg-white/20 px-3 py-1 rounded-full">{"<libro/123>"}</span>
                  </div>
                  <ArrowRight className="text-purple-600 text-4xl font-bold" />
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl text-white text-center shadow-xl transform hover:scale-105 transition-all duration-300">
                    <span className="font-bold text-xl">Predicado</span>
                    <span className="text-sm mt-2 bg-white/20 px-3 py-1 rounded-full">(dc:title)</span>
                  </div>
                  <ArrowRight className="text-purple-600 text-4xl font-bold" />
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl text-white text-center shadow-xl transform hover:scale-105 transition-all duration-300">
                    <span className="font-bold text-xl">Objeto</span>
                    <span className="text-sm mt-2 bg-white/20 px-3 py-1 rounded-full">("Mi Libro")</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-purple-700 font-semibold text-lg">
                    = Un triple RDF que expresa: "El libro con ID 123 tiene el título 'Mi Libro'"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-t-4 border-gradient-to-r from-pink-300 to-purple-300 my-16" />

        {/* Sección: El Propósito de la Herramienta */}
        <section className="mb-20 text-center">
          <h2 className="text-4xl font-bold text-purple-800 mb-12">2. El Propósito de la Herramienta</h2>
          <div className="bg-white p-10 rounded-xl shadow-2xl border-2 border-pink-200 max-w-6xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Zap className="w-12 h-12 text-yellow-500 mr-4" />
              <h3 className="text-2xl font-bold text-purple-800">Transformación Inteligente de Datos</h3>
            </div>
            <p className="text-xl text-purple-700 mb-8 leading-relaxed">
              Nuestra aplicación revoluciona la conversión de CSV (datos tabulares planos) a RDF (datos estructurados y
              semánticos). Te guía paso a paso a través de un flujo intuitivo y visual para mapear columnas, definir
              entidades y generar archivos en formato Turtle (TTL) de calidad profesional.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-10">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-purple-800 mb-2">Datos CSV</h4>
                <p className="text-purple-600">Información tabular simple y plana</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-purple-600 text-6xl font-bold animate-pulse">→</div>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Database className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-purple-800 mb-2">RDF (TTL)</h4>
                <p className="text-purple-600">Conocimiento estructurado y enlazado</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <Card className="border-2 border-pink-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-800">
                    <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
                    Antes: Proceso Manual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-purple-700">
                    <li>• Conocimiento técnico especializado requerido</li>
                    <li>• Programación manual de transformaciones</li>
                    <li>• Propenso a errores humanos</li>
                    <li>• Tiempo de desarrollo extenso</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-800">
                    <Star className="w-6 h-6 mr-2 text-green-500" />
                    Ahora: Proceso Automatizado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-purple-700">
                    <li>• Interfaz visual intuitiva</li>
                    <li>• Detección automática de tipos de datos</li>
                    <li>• Validación en tiempo real</li>
                    <li>• Resultados en minutos, no días</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <hr className="border-t-4 border-gradient-to-r from-pink-300 to-purple-300 my-16" />

        {/* Sección: El Flujo de Trabajo Paso a Paso */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center text-purple-800 mb-12">3. El Flujo de Trabajo Paso a Paso</h2>
          <p className="text-xl text-center text-purple-700 mb-12 max-w-4xl mx-auto">
            Nuestro proceso de 5 pasos te guía desde la carga de tu archivo CSV hasta la generación de RDF profesional,
            sin necesidad de conocimientos técnicos previos.
          </p>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Paso 1: Subir Archivo */}
            <Card className="bg-white shadow-xl border-2 border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="text-white w-8 h-8" />
                </div>
                <CardTitle className="text-lg font-semibold text-purple-800">1. Subir Archivo</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-700 text-sm mb-4">Carga tu archivo CSV y la herramienta automáticamente:</p>
                <ul className="text-xs text-purple-600 space-y-1 text-left">
                  <li>• Detecta el delimitador correcto</li>
                  <li>• Identifica columnas y tipos</li>
                  <li>• Muestra valores de ejemplo</li>
                  <li>• Valida la estructura del archivo</li>
                </ul>
              </CardContent>
            </Card>

            {/* Paso 2: Configuración de Propiedades */}
            <Card className="bg-white shadow-xl border-2 border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="text-white w-8 h-8" />
                </div>
                <CardTitle className="text-lg font-semibold text-purple-800">2. Configurar Propiedades</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-700 text-sm mb-4">Define tu entidad principal y mapea propiedades:</p>
                <ul className="text-xs text-purple-600 space-y-1 text-left">
                  <li>• Nombre y clase RDF de la entidad</li>
                  <li>• Columna identificadora única</li>
                  <li>• Mapeo a propiedades RDF estándar</li>
                  <li>• Configuración de multivalores</li>
                </ul>
              </CardContent>
            </Card>

            {/* Paso 3: Selección de Entidades */}
            <Card className="bg-white shadow-xl border-2 border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="text-white w-8 h-8" />
                </div>
                <CardTitle className="text-lg font-semibold text-purple-800">3. Selección de Entidades</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-700 text-sm mb-4">Identifica entidades separadas en tus datos:</p>
                <ul className="text-xs text-purple-600 space-y-1 text-left">
                  <li>• Marca columnas como entidades</li>
                  <li>• Asigna nombres descriptivos</li>
                  <li>• Crea relaciones entre entidades</li>
                  <li>• Optimiza la estructura del grafo</li>
                </ul>
              </CardContent>
            </Card>

            {/* Paso 4: Configurar Entidades y Relaciones */}
            <Card className="bg-white shadow-xl border-2 border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link className="text-white w-8 h-8" />
                </div>
                <CardTitle className="text-lg font-semibold text-purple-800">4. Configurar Relaciones</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-700 text-sm mb-4">Define relaciones complejas entre entidades:</p>
                <ul className="text-xs text-purple-600 space-y-1 text-left">
                  <li>• Propiedades literales vs recursos</li>
                  <li>• Relaciones entre entidades</li>
                  <li>• Múltiples propiedades RDF por columna</li>
                  <li>• Validación de configuración</li>
                </ul>
              </CardContent>
            </Card>

            {/* Paso 5: Generar RDF */}
            <Card className="bg-white shadow-xl border-2 border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-white w-8 h-8" />
                </div>
                <CardTitle className="text-lg font-semibold text-purple-800">5. Generar RDF (TTL)</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-700 text-sm mb-4">Produce RDF de calidad profesional:</p>
                <ul className="text-xs text-purple-600 space-y-1 text-left">
                  <li>• Validación completa de configuración</li>
                  <li>• Generación de URIs únicas</li>
                  <li>• Deduplicación automática</li>
                  <li>• Formato Turtle optimizado</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={onStartConverter}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg px-10 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Probar el Flujo Completo
            </Button>
          </div>
        </section>

        <hr className="border-t-4 border-gradient-to-r from-pink-300 to-purple-300 my-16" />

        {/* Sección: Tecnologías Utilizadas */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center text-purple-800 mb-12">4. Tecnologías de Vanguardia</h2>
          <p className="text-xl text-center text-purple-700 mb-12 max-w-4xl mx-auto">
            Construido con las mejores tecnologías modernas para garantizar rendimiento, confiabilidad y una experiencia
            de usuario excepcional.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Next.js + React */}
            <Card className="bg-white shadow-xl border-2 border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-purple-800">Next.js + React</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 text-sm mb-4">
                  Framework moderno de React para aplicaciones web de alto rendimiento.
                </p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Renderizado del lado del servidor</li>
                  <li>• Componentes reutilizables</li>
                  <li>• Optimización automática</li>
                  <li>• Experiencia de usuario fluida</li>
                </ul>
              </CardContent>
            </Card>

            {/* TypeScript */}
            <Card className="bg-white shadow-xl border-2 border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-purple-800">TypeScript</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 text-sm mb-4">
                  JavaScript con tipado estático para mayor seguridad y mantenibilidad.
                </p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Detección temprana de errores</li>
                  <li>• Mejor experiencia de desarrollo</li>
                  <li>• Código más legible y mantenible</li>
                  <li>• Refactoring seguro</li>
                </ul>
              </CardContent>
            </Card>

            {/* Tailwind + shadcn/ui */}
            <Card className="bg-white shadow-xl border-2 border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-purple-800">Tailwind + shadcn/ui</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 text-sm mb-4">
                  Sistema de diseño moderno con componentes pre-construidos y personalizables.
                </p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Diseño responsive automático</li>
                  <li>• Componentes accesibles</li>
                  <li>• Consistencia visual</li>
                  <li>• Personalización completa</li>
                </ul>
              </CardContent>
            </Card>

            {/* Papa Parse */}
            <Card className="bg-white shadow-xl border-2 border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-purple-800">Papa Parse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 text-sm mb-4">
                  Librería especializada para procesamiento robusto de archivos CSV.
                </p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Procesamiento en el navegador</li>
                  <li>• Detección automática de delimitadores</li>
                  <li>• Manejo de archivos grandes</li>
                  <li>• Validación de datos</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-xl border-2 border-purple-200">
            <h3 className="text-2xl font-bold text-center text-purple-800 mb-6">Arquitectura Técnica</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Frontend</h4>
                <p className="text-sm text-purple-700">
                  React + TypeScript + Tailwind CSS para una interfaz moderna y responsive
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Procesamiento</h4>
                <p className="text-sm text-purple-700">
                  Papa Parse + algoritmos personalizados para análisis inteligente de CSV
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Generación RDF</h4>
                <p className="text-sm text-purple-700">
                  Motor personalizado para crear RDF válido y optimizado en formato Turtle
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-t-4 border-gradient-to-r from-pink-300 to-purple-300 my-16" />

        {/* Sección: ¿Cómo Simplifica el Proceso? */}
        <section className="text-center mb-20">
          <h2 className="text-4xl font-bold text-purple-800 mb-12">5. Revolución en la Creación de Datos Enlazados</h2>
          <div className="bg-white p-10 rounded-xl shadow-2xl border-2 border-pink-200 max-w-6xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Zap className="w-12 h-12 text-yellow-500 mr-4" />
              <h3 className="text-3xl font-bold text-purple-800">Democratizando la Web Semántica</h3>
            </div>
            <p className="text-xl text-purple-700 mb-10 leading-relaxed">
              Esta herramienta transforma un proceso que antes requería conocimientos especializados de RDF, ontologías
              y programación en una tarea visual, intuitiva y accesible para cualquier profesional que trabaje con
              datos.
            </p>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="text-left space-y-6">
                <h4 className="text-2xl font-bold text-purple-800 mb-4">Beneficios Clave</h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-pink-600 text-lg">Interfaz Visual Intuitiva:</strong>
                      <p className="text-purple-700">
                        Elimina completamente la necesidad de escribir código RDF manualmente o aprender sintaxis
                        compleja.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-pink-600 text-lg">Automatización Inteligente:</strong>
                      <p className="text-purple-700">
                        Detecta automáticamente tipos de datos, delimitadores y sugiere mapeos RDF basados en
                        estándares.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-pink-600 text-lg">Guía Paso a Paso:</strong>
                      <p className="text-purple-700">
                        Proceso estructurado que facilita la toma de decisiones clave en el mapeo y transformación de
                        datos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-pink-600 text-lg">Accesibilidad Universal:</strong>
                      <p className="text-purple-700">
                        Democratiza la creación de datos enlazados para investigadores, bibliotecarios, analistas y
                        profesionales de datos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-left space-y-6">
                <h4 className="text-2xl font-bold text-purple-800 mb-4">Casos de Uso</h4>
                <div className="space-y-4">
                  <Card className="border-2 border-purple-200 p-4">
                    <h5 className="font-semibold text-purple-800 mb-2">Bibliotecas Digitales</h5>
                    <p className="text-sm text-purple-700">
                      Convierte catálogos bibliográficos en datos enlazados para mejorar la descubribilidad.
                    </p>
                  </Card>
                  <Card className="border-2 border-purple-200 p-4">
                    <h5 className="font-semibold text-purple-800 mb-2">Investigación Académica</h5>
                    <p className="text-sm text-purple-700">
                      Transforma datasets de investigación en formatos interoperables y reutilizables.
                    </p>
                  </Card>
                  <Card className="border-2 border-purple-200 p-4">
                    <h5 className="font-semibold text-purple-800 mb-2">Datos Gubernamentales</h5>
                    <p className="text-sm text-purple-700">
                      Publica datos abiertos en formatos semánticos para mayor transparencia.
                    </p>
                  </Card>
                  <Card className="border-2 border-purple-200 p-4">
                    <h5 className="font-semibold text-purple-800 mb-2">Empresas</h5>
                    <p className="text-sm text-purple-700">
                      Integra datos de diferentes fuentes en un grafo de conocimiento unificado.
                    </p>
                  </Card>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl border-2 border-pink-300">
              <h4 className="text-xl font-bold text-purple-800 mb-4">Impacto Transformador</h4>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-pink-600 mb-2">90%</div>
                  <p className="text-sm text-purple-700">Reducción en tiempo de desarrollo</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pink-600 mb-2">0</div>
                  <p className="text-sm text-purple-700">Conocimiento técnico previo requerido</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pink-600 mb-2">100%</div>
                  <p className="text-sm text-purple-700">RDF válido y estándar generado</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Button
                onClick={onStartConverter}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-2xl px-16 py-5 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <ArrowRight className="w-8 h-8 mr-4" />
                ¡Transforma tus Datos Ahora!
              </Button>
            </div>
          </div>
        </section>

        <footer className="text-center text-purple-600 text-lg mt-16 py-8 border-t-2 border-purple-200">
          <p className="mb-4">&copy; 2025 Conversor CSV a RDF. Todos los derechos reservados.</p>
          <p className="text-sm text-purple-500">
            Desarrollado con ❤️ para democratizar la Web Semántica y hacer los datos enlazados accesibles para todos.
          </p>
        </footer>
      </div>
    </div>
  )
}

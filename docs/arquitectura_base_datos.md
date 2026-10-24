# Arquitectura de Base de Datos - Transmetro

A continuación se presenta el modelo conceptual de las entidades y relaciones generadas con TypeORM para el sistema de control del Transmetro.

```mermaid
classDiagram
    Municipalidad "1" *-- "many" Linea : Tiene
    Municipalidad "1" *-- "many" Estacion : Tiene
    
    Linea "1" -- "many" LineaEstacion : Contiene
    Estacion "1" -- "many" LineaEstacion : Contiene
    class LineaEstacion {
        +int orden
    }
    
    Estacion "1" *-- "many" Acceso : Tiene
    Acceso "1" *-- "many" Guardia : Controlado por
    
    Estacion "1" *-- "many" Parqueo : Tiene
    
    Linea "1" o-- "many" Bus : Asigna
    Parqueo "1" o-- "many" Bus : Parapquea
    Piloto "1" o-- "many" Bus : Conduce
    
    class Bus {
        +string placa
        +int capacidad_maxima
        +int pasajeros_actuales
    }
    class Piloto {
        +string historial_educativo
        +string residencia
        +string comunicacion
    }
```

## Reglas de Negocio Implementadas:
- **Orden de Ruta**: Resuelto con la tabla intermedia `LineaEstacion`.
- **Alertas de Capacidad (25% / 50%)**: Soportadas matemáticamente por los campos `capacidad_maxima` y `pasajeros_actuales` en la entidad `Bus`.
- **Restricción de Buses**: Pueden no estar asignados a una línea, pero JAMÁS pueden estar sin un parqueo.

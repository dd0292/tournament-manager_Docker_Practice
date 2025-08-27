#!/bin/bash

# Crear torneo
curl -X POST http://localhost:3000/upload-data \
  -H "Content-Type: application/json" \
  -d '[
        {
            "title": "Senior Avanzados Hombres ✅",
            "type": "single_elimination",
            "roster": [
            {
                "id": 93,
                "name": "93 - [Karate Patito] Juan Perez",
                "weight": 83,
                "age": 45
            },
            {
                "id": 94,
                "name": "94 - [Karate los pollitos] Pedro Picapiedra",
                "weight": 82,
                "age": 44
            }
            ]
        }
    ]'

# Ver torneos
curl http://localhost:3000/fetch-tournaments

#NOTA: Lo intente con Postman sin 'crul'; pero no puede....
// Conjuntos de ejemplo SINTÉTICOS. Empresas ficticias; los problemas son los típicos de un
// export real de Excel o de un sistema de planta, puestos a propósito para que el analizador los encuentre.
export type Sample = { id: string; file: string; title: [string, string]; context: [string, string]; csv: string };

const clientes = `cliente,rfc,contacto,telefono,correo,cp,municipio,credito_dias
Refaccionaria Del Norte,RDN150302AB4,Marta Ríos,8183456712,compras@delnorte.mx,64000,Monterrey,30
Ferretera Cumbres,fcu-190711-k21,Jorge Leal,+52 81 2233 4455,jleal@ferrecumbres.mx,64610,Monterrey,15
Abarrotes La Estrella,AES0812053T9,Lupita Garza,81 1122 3344,LUPITA@LAESTRELLA.MX ,66450,San Nicolás,0
Taller Mecánico Treviño,TMT201399XX1,Raúl Treviño,8119876543,raul@tallertrevino.mx,66230,San Pedro,30
Papelería Colón,PCO050505QW2,Elsa Colón,811234567,ventas@,64720,Monterrey,15
Distribuidora Sierra Madre,DSM1102148N6,Iván Sierra,8187654321,isierra@dsmadre.mx,66269,san pedro,45
Café Aurora,CAU160920HB7,Sofía Ramos,8110203040,sofia@cafeaurora.mx,66220,San Pedro,0
Tortillería El Maizal,TMA090101JK3,Pedro Villarreal,(81) 8899-0011,pedro@elmaizal.mx,66470,San Nicolas,15
Muebles Contreras CDMX,MCO140430LM5,Ana Contreras,55 5566 7788,ana@mueblescontreras.mx,6600,Cuauhtémoc,30
Consultorio Dental Sonrisa,CDS180615PQ8,Dra. Leticia Mata,8155443322,citas@sonrisa.mx,64620,Monterrey,-15
`;

const planta = `folio,fecha,turno,linea,modelo,estacion,defecto,severidad,piezas_revisadas,piezas_rechazadas,inspector
Q-1041,2026-03-02,Matutino,L1,M-21 Sedán,Carrocería,Rayón en puerta trasera,Menor,120,3,R. Garza
Q-1042,2026-03-02,Matutino,L1,M-21 Sedán,Pintura,Burbuja en cofre,Mayor,118,6,R. Garza
Q-1043,2026-03-02,Vespertino,L2,M-34 SUV,Ensamble final,Holgura en puerta,Mayor,96,4,L. Treviño
Q-1044,2026-03-03,Vespertino,L2,M-34 SUV,Prueba de agua,Fuga en sello de parabrisas,Crítico,96,2,L. Treviño
Q-1045,03/03/2026,Nocturno,L3,M-40 Pickup,Carrocería,Soldadura incompleta,Crítico,80,5,A. Cantú
Q-1046,2026-03-03,Nocturno,L3,M-40 Pickup,PINTURA ,Escurrimiento en caja,Menor,80,2,A. Cantú
Q-1047,2026-03-04,Matutino,L1,M-21 Sedán,Ensamble final,Torque fuera de rango,Mayor,"1,120",9,R. Garza
Q-1048,2026-03-04,Matutino,L1,M-21 Sedán,pintura,Burbuja en cofre,Menor,122,1,
Q-1044,2026-03-03,Vespertino,L2,M-34 SUV,Prueba de agua,Fuga en sello de parabrisas,Crítico,96,2,L. Treviño
Q-1049,2026-03-05,Vespertino,L2,M-34 SUV,Carrocería,Rayón en salpicadera,Menor,101,2,M. Salinas
Q-1050,05/03/2026,Vespertino,L2,M-34 SUV,Prueba de agua,Fuga en sello de puerta,Mayor,99,3,M. Salinas
Q-1051,2026-03-05,Nocturno,L3,M-40 Pickup,Ensamble final,Arnés mal conectado,Crítico,78,4,A. Cantú
Q-1052,2026-03-06,Matutino,L1,M-21 Sedán,Carrocería,Rayón en puerta trasera,Menor,119,2,R. Garza
Q-1053,2026-03-06,Matutino,L1,M-21 Sedán, Pintura,Diferencia de tono,Mayor,119,5,R. Garza
Q-1054,2026-03-06,Vespertino,L2,M-34 SUV,Ensamble final,Holgura en cofre,Menor,95,12,L. Treviño
Q-1055,2026-03-09,Nocturno,L3,M-40 Pickup,Prueba de agua,Fuga en sello de parabrisas,Crítico,76,6,
Q-1056,2026-03-09,matutino,L1,M-21 Sedán,Ensamble final,Torque fuera de rango,Mayor,121,4,R. Garza
Q-1057,09/03/2026,Vespertino,L2,M-34 SUV,Pintura,Burbuja en techo,Menor,97,2,M. Salinas
Q-1058,2026-03-10,Nocturno,L3,M-40 Pickup,Carrocería,Abolladura en caja,Mayor,79,81,A. Cantú
Q-1059,2026-03-10,Matutino,L1,M-21 Sedán,Prueba de agua,Fuga en sello de puerta,Mayor,120,3,R. Garza
Q-1060,2026-03-10,Vespertino,L2,M-34 SUV,Ensamble final,Arnés mal conectado,,98,2,L. Treviño
Q-1061,2026-03-11,Nocturno,L3,M-40 Pickup,Pintura,Diferencia de tono,Menor,80,3,A. Cantú
Q-1062,2026-03-11,Matutino,L1,M-21 Sedán,Carrocería,Soldadura incompleta,Crítico,118,2,R. Garza`;

const agua = `reporte,fecha_reporte,colonia,municipio,tipo,prioridad,dias_para_atender,estatus
F-20931,2026-02-03,Mitras Centro,Monterrey,Fuga en toma domiciliaria,Media,3,Atendido
F-20932,2026-02-03,Anáhuac,San Nicolás,Fuga en red principal,Alta,1,Atendido
F-20933,2026-02-04,Cumbres 3er Sector,Monterrey,Baja presión,Baja,6,Atendido
F-20934,04/02/2026,Las Puentes,San Nicolas,Fuga en toma domiciliaria,Media,4,Atendido
F-20935,2026-02-05,Valle Oriente,San Pedro Garza García,Drenaje obstruido,Alta,2,Atendido
F-20936,2026-02-05,Cerro de la Silla,Guadalupe,Fuga en red principal,Alta,,Abierto
F-20937,2026-02-06,Linda Vista,guadalupe,Baja presión,Baja,-2,Atendido
F-20932,2026-02-03,Anáhuac,San Nicolás,Fuga en red principal,Alta,1,Atendido
F-20938,2026-02-07,Centro,Apodaca,Drenaje obstruido,Media,5,Atendido
F-20939,2026-02-07,Pueblo Nuevo,Apodaca ,Fuga en toma domiciliaria,Media,3,Atendido
F-20940,09/02/2026,Contry,Monterrey,Fuga en red principal,Alta,1,Atendido
F-20941,2026-02-10,Hacienda Los Morales,SAN NICOLÁS,Baja presión,Baja,7,Atendido
F-20942,2026-02-10,Del Valle,San Pedro Garza García,Fuga en toma domiciliaria,Media,,Abierto
F-20943,2026-02-11,Tecnológico,Monterrey,Drenaje obstruido,Alta,2,Atendido
F-20944,2026-02-12,Valle Verde,Monterrey,Fuga en red principal,Alta,1,Atendido
F-20945,2026-02-12,Guadalupe Centro,Guadalupe,Baja presión,Baja,8,Atendido`;

export const SAMPLES: Sample[] = [
 { id: 'planta', file: 'inspecciones_planta_marzo.csv', title: ['Planta de ensamble', 'Assembly plant'], context: ['Inspecciones de calidad por turno en una planta automotriz ficticia.', 'Quality inspections per shift at a fictional car plant.'], csv: planta },
 { id: 'agua', file: 'reportes_fugas_febrero.csv', title: ['Organismo de agua', 'Water utility'], context: ['Reportes ciudadanos de fugas en un organismo público ficticio del área metropolitana de Monterrey.', 'Citizen leak reports at a fictional public water utility in the Monterrey metro area.'], csv: agua },
 { id: 'clientes', file: 'padron_clientes.csv', title: ['Padrón de clientes', 'Customer list'], context: ['Clientes de una distribuidora ficticia de Monterrey: RFC, teléfonos, correos y códigos postales.', 'Customers of a fictional Monterrey distributor: tax IDs, phones, emails and postal codes.'], csv: clientes },
];

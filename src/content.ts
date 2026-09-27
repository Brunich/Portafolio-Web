export type Lang = 'es' | 'en';

export const copy = {
  es: {
    nav:['Proyectos','Laboratorio','Sobre mí'], contact:'Hablemos',
    title:'Software con', titleAccent:'otra dimensión.',
    intro:'Soy Bruno Salas. Desarrollo aplicaciones web, trabajo con datos y construyo mundos interactivos.',
    view:'Ver proyectos', cv:'Descargar CV', location:'Monterrey, México', discipline:'Desarrollo web & gráficos en tiempo real',
    scroll:'Explora mi trabajo', selected:'Ideas que puedes explorar.',
    selectedIntro:'De una aplicación universitaria a materiales que reaccionan a la luz. Cada proyecto resuelve un problema distinto.',
    allCode:'Mi GitHub', explore:'Explorar proyecto', challenge:'El reto', contribution:'El desarrollo', result:'Lo que puedes ver',
    visit:'Abrir aplicación', source:'Ver en GitHub', original:'Estudio independiente · Aqua Stylized 3D · Godot',
    labTitle:'Un cambio. Otra sensación.',
    labIntro:'Mueve la división, cambia el material y observa cómo la luz transforma la misma geometría.',
    labNote:'Adaptación WebGL creada para este portafolio, inspirada en mi trabajo con shaders en Godot. Los videos de arriba muestran los proyectos originales.',
    aboutTitle:'Curiosidad visual.\nPensamiento de software.',
    about:'Estudio Ingeniería en Software en la UANL. Me interesa tanto lo que ocurre detrás de una interfaz como la sensación de usarla: conectar datos, resolver errores y dar forma a una idea.',
    about2:'He trabajado en soporte y validación de sistemas, acompañado a estudiantes de programación y desarrollado proyectos web y gráficos en tiempo real.',
    education:'Ingeniería en Software', university:'Universidad Autónoma de Nuevo León',
    timelineTitle:'Experiencia y formación', learning:'Formación complementaria', certificate:'Ver certificado',
    skillsTitle:'Herramientas según el problema.',
    skillGroups:[['Web & producto','React · TypeScript · Vite · Node.js · Supabase'],['Datos & automatización','Python · Pandas · SQL · R · Excel'],['Gráficos & sistemas','Godot · GDScript · Shaders · Git']],
    languages:'Español nativo · Inglés fluido · Portugués competente',
    contactTitle:'¿Qué construimos ahora?',contactText:'Una idea, una oportunidad o un problema interesante. Me gustaría conocerlo.',
    mail:'Escríbeme', copyMail:'Copiar correo', copied:'Correo copiado', copyError:'No se pudo copiar. Puedes seleccionar el correo de abajo.',
    footer:'Diseñado para explorar. Construido para funcionar.', pause:'Pausar movimiento', play:'Activar movimiento', menu:'Abrir navegación', close:'Cerrar navegación',
    skip:'Ir al contenido', updated:'CV · septiembre 2026',
    experience:[
      {year:'2024',role:'Tutoría de programación y bases de datos',org:'UANL',text:'Diagnóstico de errores, consultas SQL y apoyo en C, C# y JavaScript. Guías y demostraciones para explicar conceptos con claridad.'},
      {year:'2023',role:'Desarrollo de software y soporte de sistemas',org:'UANL · Asistente',text:'Validación de actualizaciones, reproducción de defectos y revisión de flujos de datos. Documentación para equipos técnicos.'}
    ],
    projects:[
      {id:'rogue',title:'IA Rogue',type:'Mundos interactivos',description:'Un roguelike 3D donde una IA busca su libertad. Biomas procedurales, combate y una identidad visual propia.',tags:['Godot 4','GDScript','Shaders'],challenge:'Construir un mundo modular que combine exploración, combate y una dirección visual coherente.',contribution:'Trabajo en modelos 3D, shaders, biomas procedurales y organización de sistemas y clases. El proyecto sigue en desarrollo.',result:'El video corresponde a Aqua Stylized 3D, mi estudio independiente de agua en Godot. Ilustra mi trabajo con materiales; no es una captura de gameplay de IA Rogue. El repositorio del juego es privado.',link:'#lab',linkType:'lab',media:'aqua',status:'En desarrollo'},
      {id:'punto',title:'Punto U',type:'Web + Android',description:'Estudiantes que publican favores y los cambian por dinero, sesiones de estudio u otro favor, en la web y Android.',tags:['React','Supabase','Capacitor'],challenge:'Llevar una experiencia universitaria desde la interfaz hasta una aplicación conectada a una base de datos y disponible en móvil.',contribution:'Interfaz con React y Vite, integración con Supabase y empaquetado Android con Capacitor. Flujo de perfiles universitarios y datos en la nube.',result:'Puedes abrir la aplicación publicada y explorar su acceso. La imagen es una captura real de la pantalla de perfil, sin datos personales.',link:'https://punto-u-app.vercel.app',linkType:'visit',media:'punto',status:'Web publicada'},
      {id:'cel',title:'Faceted Cel Lighting',type:'Materiales & iluminación',description:'De superficies suaves a facetas definidas. Luz por bandas y bordes que cambian el carácter de una escena.',tags:['GLSL / Godot','Cel shading','3D'],challenge:'Conseguir una iluminación estilizada que conserve una lectura clara de las formas.',contribution:'Material con normales por faceta, bandas de iluminación, tonos de sombra y realce de silueta. Escena de demostración en Godot.',result:'Video original del material en una escena de ruinas. El laboratorio permite comparar iluminación continua y estilizada sobre una misma geometría.',link:'#lab',linkType:'lab',media:'cel',status:'Demo visual'}
    ]
  },
  en: {
    nav:['Projects','Laboratory','About'], contact:'Let’s talk',
    title:'Software with', titleAccent:'another dimension.',
    intro:'I’m Bruno Salas. I build web applications, work with data and create interactive worlds.',
    view:'View projects',cv:'Download CV',location:'Monterrey, Mexico',discipline:'Web development & real-time graphics',
    scroll:'Explore my work',selected:'Ideas you can explore.',
    selectedIntro:'From a university app to materials that respond to light. Each project tackles a different problem.',
    allCode:'My GitHub',explore:'Explore project',challenge:'The challenge',contribution:'The development',result:'What you can explore',
    visit:'Open application',source:'View on GitHub',original:'Independent study · Aqua Stylized 3D · Godot',
    labTitle:'One change. A different feeling.',labIntro:'Move the divider, switch materials and see how light transforms the same geometry.',
    labNote:'A WebGL adaptation built for this portfolio, inspired by my shader work in Godot. The videos above show the original projects.',
    aboutTitle:'Visual curiosity.\nSoftware thinking.',about:'I study Software Engineering at UANL. I care about what happens behind an interface and how it feels to use: connecting data, resolving errors and giving ideas a working form.',
    about2:'My experience includes system support and validation, programming tutoring, and projects across web development and real-time graphics.',
    education:'Software Engineering',university:'Universidad Autónoma de Nuevo León',timelineTitle:'Experience & education',learning:'Additional education',certificate:'View certificate',
    skillsTitle:'The right tools for the problem.',skillGroups:[['Web & product','React · TypeScript · Vite · Node.js · Supabase'],['Data & automation','Python · Pandas · SQL · R · Excel'],['Graphics & systems','Godot · GDScript · Shaders · Git']],
    languages:'Native Spanish · Fluent English · Proficient Portuguese',
    contactTitle:'What should we build next?',contactText:'An idea, an opportunity, or an interesting problem. I’d love to hear about it.',
    mail:'Email me',copyMail:'Copy email',copied:'Email copied',copyError:'Could not copy. You can select the email below.',footer:'Designed to explore. Built to work.',pause:'Pause motion',play:'Enable motion',menu:'Open navigation',close:'Close navigation',skip:'Skip to content',updated:'CV · September 2026',
    experience:[
      {year:'2024',role:'Programming & database tutoring',org:'UANL',text:'Error diagnosis, SQL queries and support in C, C# and JavaScript. Guides and demonstrations to explain concepts clearly.'},
      {year:'2023',role:'Software development & systems support',org:'UANL · Assistant',text:'Update validation, defect reproduction and data-flow reviews. Process documentation for technical teams.'}
    ],
    projects:[
      {id:'rogue',title:'IA Rogue',type:'Interactive worlds',description:'A 3D roguelike about an AI seeking freedom. Procedural biomes, combat and a distinctive visual identity.',tags:['Godot 4','GDScript','Shaders'],challenge:'Build a modular world that brings exploration, combat and a coherent visual direction together.',contribution:'Work on 3D models, shaders, procedural biomes and the organization of systems and classes. The project is in active development.',result:'The video is from Aqua Stylized 3D, my independent water study in Godot. It illustrates my material work, not IA Rogue gameplay. The game repository is private.',link:'#lab',linkType:'lab',media:'aqua',status:'In development'},
      {id:'punto',title:'Punto U',type:'Web + Android',description:'Students post favors and trade them for money, study sessions or another favor, on the web and Android.',tags:['React','Supabase','Capacitor'],challenge:'Take a university experience from interface design to a database-backed application available on mobile.',contribution:'React and Vite interface, Supabase integration and Android packaging with Capacitor. University profiles and cloud data.',result:'Open the published app and explore its entry flow. The image is a real capture of the profile screen without personal information.',link:'https://punto-u-app.vercel.app',linkType:'visit',media:'punto',status:'Published web app'},
      {id:'cel',title:'Faceted Cel Lighting',type:'Materials & lighting',description:'From smooth surfaces to crisp facets. Light bands and edges that change the character of a scene.',tags:['GLSL / Godot','Cel shading','3D'],challenge:'Create stylized lighting that keeps shapes easy to read.',contribution:'A material with faceted normals, lighting bands, tinted shadows and silhouette highlights. Demonstration scene in Godot.',result:'Original video of the material in a ruins scene. The laboratory compares continuous and stylized lighting on the same geometry.',link:'#lab',linkType:'lab',media:'cel',status:'Visual demo'}
    ]
  }
};

export const certificates = [
  {year:'2022',title:'CS50: Introduction to Computer Science',org:'Harvard University · edX',url:'https://certificates.cs50.io/8590ae67-a83c-4298-b4b3-1397e755e729.pdf?size=letter'},
  {year:'2020',title:'Data Science: R Basics',org:'Harvard University · edX',url:'https://courses.edx.org/certificates/1b0fd645690b49619ee98bf7973b1fec'},
  {year:'2022',title:'Introduction to Corporate Finance',org:'Columbia University · edX',url:'https://courses.edx.org/certificates/d74d4b37ef1d4d5582485b64be41537e'}
];

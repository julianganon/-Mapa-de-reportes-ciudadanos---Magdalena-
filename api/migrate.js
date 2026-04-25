import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const MIGRATE_SECRET = process.env.MIGRATE_SECRET;

const REPORTS = [
  {
    "originalId": "-OquhKUnUzPSkqmbAJZk",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Mal estado con o sin lluvia",
    "lat": -35.26788697984361,
    "lng": -57.57715111967628,
    "timestamp": "2026-04-23T14:19:00.221Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqui1eSt6L0FAunwF4N",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      },
      {
        "icon": "🌊",
        "id": "zanja",
        "name": "Zanja en mal estado"
      }
    ],
    "description": "El cordon se llena de aguas servidas y hace 7 meses no pasan a limpiarlo se acumula pudrición",
    "lat": -35.0724029,
    "lng": -57.5218861,
    "timestamp": "2026-04-23T14:22:05.371Z",
    "status": "Pendiente",
    "contactName": "Antonella Sanchez",
    "contactInfo": "joaquinludue6@gmail.com"
  },
  {
    "originalId": "-OquinGdx3sFCGFn0peY",
    "cats": [
      {
        "icon": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Tengo que ir a buscar a mi hija a la escuela y no puedo con la silla de ruedas",
    "lat": -35.08206711514824,
    "lng": -57.5118081830442,
    "timestamp": "2026-04-23T14:25:24.256Z",
    "status": "Pendiente",
    "contactName": "Lucas",
    "contactInfo": null
  },
  {
    "originalId": "-Oquiv-JmUZkaxrxneOr",
    "cats": [
      {
        "icon": "💡",
        "id": "luminaria",
        "name": "Luminaria sin funcionamiento"
      },
      {
        "icon": "🌊",
        "id": "zanja",
        "name": "Zanja en mal estado"
      }
    ],
    "description": "Colocaron las luces el año pasado y se rompieron en menos de un mes, se hizo el reclamo y no volvieron a arreglar",
    "lat": -35.0769948,
    "lng": -57.5032379,
    "timestamp": "2026-04-23T14:25:55.086Z",
    "status": "Pendiente",
    "contactName": "Naza",
    "contactInfo": null
  },
  {
    "originalId": "-Oquj7XzHNHQVjHIjcjE",
    "cats": [
      {
        "icon": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Está muy alto, no se puede subir",
    "lat": -35.08055559570559,
    "lng": -57.51619416465474,
    "timestamp": "2026-04-23T14:26:51.465Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oquj7hPZgW1a7uGWUu5",
    "cats": [
      {
        "icon": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Quiero ir al correo y es imposible. Es toda la manzana",
    "lat": -35.07927366480112,
    "lng": -57.51795262098313,
    "timestamp": "2026-04-23T14:26:52.058Z",
    "status": "Pendiente",
    "contactName": "Agustin",
    "contactInfo": null
  },
  {
    "originalId": "-OqujAy2T8RD_UVs4ch-",
    "cats": [
      {
        "icon": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      }
    ],
    "description": "Falta luminaria en una cuadra. Sobre calle Dr Illia, desde Las Carretas hasta Crl.Pringles.",
    "lat": -35.08904500359438,
    "lng": -57.50031352081351,
    "timestamp": "2026-04-23T14:27:05.251Z",
    "status": "Pendiente",
    "contactName": "Marcelo",
    "contactInfo": "2221412007"
  },
  {
    "originalId": "-OqujCnJtO5ZggjFYdUY",
    "cats": [
      {
        "icon": "🗑️",
        "id": "basura",
        "name": "Basura acumulada"
      }
    ],
    "description": "Hfh",
    "lat": -35.08204683642798,
    "lng": -57.507355380803354,
    "timestamp": "2026-04-23T14:27:12.590Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqujGQNKISqwNZPRoSZ",
    "cats": [
      {
        "icon": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Quiero ir al anses y es imposible. Es toda la manzana",
    "lat": -35.07894118759401,
    "lng": -57.51903254538775,
    "timestamp": "2026-04-23T14:27:27.767Z",
    "status": "Pendiente",
    "contactName": "Alicia",
    "contactInfo": null
  },
  {
    "originalId": "-OqujPH-qc_-OeNX7cJG",
    "cats": [
      {
        "icon": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Un organismo provincial y la rampa hecha asi nomas. Una vergüenza.",
    "lat": -35.08292235121745,
    "lng": -57.51865804195405,
    "timestamp": "2026-04-23T14:28:04.032Z",
    "status": "Pendiente",
    "contactName": "Luisa",
    "contactInfo": null
  },
  {
    "originalId": "-Oquj_hVEcK893ZQ80II",
    "cats": [
      {
        "icon": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      }
    ],
    "description": "Empezo la obra. Me encanta pero como comerciante me esta matando. No se si puedo aguantar.",
    "lat": -35.08125696948397,
    "lng": -57.517229598015554,
    "timestamp": "2026-04-23T14:28:50.847Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqujfu8isI2CXZn6oQI",
    "cats": [
      {
        "icon": "🔧",
        "id": "cloaca",
        "name": "Sin cloaca"
      },
      {
        "icon": "💧",
        "id": "agua",
        "name": "Sin red de agua potable"
      },
      {
        "icon": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      }
    ],
    "description": "",
    "lat": -35.09137832683922,
    "lng": -57.507714629173286,
    "timestamp": "2026-04-23T14:29:16.045Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqujnvNfMiJoTGhR3cF",
    "cats": [
      {
        "icon": "🪣",
        "id": "tacho",
        "name": "Sin tacho de basura"
      }
    ],
    "description": "",
    "lat": -35.090105402156524,
    "lng": -57.50986576080323,
    "timestamp": "2026-04-23T14:29:48.894Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqukVHHGYM3zm5GrBQX",
    "cats": [
      {
        "icon": "💡",
        "id": "luminaria",
        "name": "Luminaria sin funcionamiento"
      }
    ],
    "description": "La luz hace semanas que no anda. Una boca de lobo.",
    "lat": -35.080899083447946,
    "lng": -57.51030564308167,
    "timestamp": "2026-04-23T14:32:50.758Z",
    "status": "Pendiente",
    "contactName": "Antonela",
    "contactInfo": null
  },
  {
    "originalId": "-Oqum6cYp4bw4s4bBQIo",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Calle viamonte entre araldi y la ruta de atalaya intransitable los posos tremendo y cuando llueve ni hablar .solo pasar la maquina no lo soluciona . Misma calle tiene la mitad del sajeo y donde hay sanja los palos de la luz estan a punto de caerse . Ya hice la denuncia en edelap ni pelota me dieron",
    "lat": -35.06789240863436,
    "lng": -57.518727779388435,
    "timestamp": "2026-04-23T14:39:54.059Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqunJQ9vwVzOxyTXgJH",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      },
      {
        "icon": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      },
      {
        "icon": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      },
      {
        "icon": "🪣",
        "id": "tacho",
        "name": "Sin tacho de basura"
      }
    ],
    "description": "Calles de barro y llena de agua \nNo hay iluminaria \nEl container está a 2 cuadras",
    "lat": -35.07500722969832,
    "lng": -57.53040075302125,
    "timestamp": "2026-04-23T14:45:08.054Z",
    "status": "Pendiente",
    "contactName": "Agus",
    "contactInfo": "aagustebaldi@gmail.com"
  },
  {
    "originalId": "-OquoQPZsSxFPtadzs1S",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Se asfalto la calle hace algunos años pero ya se hizo un pozo que no solo la hace intransitable para los vecinos sino peligroso porque los autos pasan y levantan pedazos de asfalto.",
    "lat": -35.07969604788894,
    "lng": -57.75048993384652,
    "timestamp": "2026-04-23T14:49:59.370Z",
    "status": "Pendiente",
    "contactName": "Agustina y familia",
    "contactInfo": null
  },
  {
    "originalId": "-OqupOfKLsE6xt9o7gfx",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "Tenemos asfalto hace algunos años y ahora parece una autopista. Necesitaríamos un lomo de burro o reductor de velocidad.",
    "lat": -35.0811142860173,
    "lng": -57.75084549890929,
    "timestamp": "2026-04-23T14:54:14.408Z",
    "status": "Pendiente",
    "contactName": "Morena",
    "contactInfo": null
  },
  {
    "originalId": "-OqupU3CfIqgiARyucxa",
    "cats": [
      {
        "icon": "💧",
        "id": "agua",
        "name": "Sin red de agua potable"
      }
    ],
    "description": "Somos todos una cuadra que no tiene red de agua ni cloaca, esperemos se pueda subsanar por qué es un tema esencial y el agua no puede faltar.",
    "lat": -35.079459280788605,
    "lng": -57.49994518761469,
    "timestamp": "2026-04-23T14:54:36.431Z",
    "status": "Pendiente",
    "contactName": "Jan",
    "contactInfo": "janomorales36@gmail.com"
  },
  {
    "originalId": "-Oqurn25yp_cGMGBVRYZ",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      },
      {
        "icon": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      },
      {
        "icon": "🪣",
        "id": "tacho",
        "name": "Sin tacho de basura"
      }
    ],
    "description": "La calle está toda pozeada ,no hay luminarias ni tampoco contenedores en una de las esquinas se junta basura",
    "lat": -35.078552091827525,
    "lng": -57.50464138000994,
    "timestamp": "2026-04-23T15:04:42.545Z",
    "status": "Pendiente",
    "contactName": "Magali",
    "contactInfo": "02214092214"
  },
  {
    "originalId": "-Oquxf5B-AdRn__4aTUz",
    "cats": [
      {
        "icon": "🗑️",
        "id": "basura",
        "name": "Basura acumulada"
      }
    ],
    "description": "Quisiera reclamar al municipio, que lave los contenedores de basura, frente al hospital no se puede vivir por la cantidad de moscas y el olor a los contenedores, por favor que alguien se ocupe, desde ya muchas gracias ! .",
    "lat": -35.07671693286925,
    "lng": -57.50822531234009,
    "timestamp": "2026-04-23T15:30:25.259Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqv3wIZBm4YufkfNA1g",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Raices de arboles muy grandes afectando el paso sobre la vereda",
    "lat": -35.08030576039966,
    "lng": -57.51588249209818,
    "timestamp": "2026-04-23T16:02:07.726Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqv8p-x-ws68iY226Q1",
    "cats": [
      {
        "icon": "🌊",
        "id": "zanja",
        "name": "Zanja en mal estado"
      }
    ],
    "description": "La sanja es un azco. Olor todo el tiempo. Hay bichos.",
    "lat": -35.09280222958983,
    "lng": -57.522697448730476,
    "timestamp": "2026-04-23T16:23:27.766Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvBF-QeTwACKCaqtKT",
    "cats": [
      {
        "icon": "🌊",
        "id": "zanja",
        "name": "Zanja en mal estado"
      }
    ],
    "description": "Hace meses hicimos el reclamo con los vecinos. Somos de empalme. Nadie nos escucha espero que ustedes si. En la ubicación pongo empalme y marco cualquiera perp la real es 108 entre 12 y 13",
    "lat": -35.06631000538759,
    "lng": -57.53856875002385,
    "timestamp": "2026-04-23T16:34:04.078Z",
    "status": "Pendiente",
    "contactName": "Roberto",
    "contactInfo": null
  },
  {
    "originalId": "-OqvVuj0HmJGfMgh3nah",
    "cats": [
      {
        "icon": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      }
    ],
    "description": "Es una boca de lobo",
    "lat": -35.2695492975905,
    "lng": -57.57390832864986,
    "timestamp": "2026-04-23T18:04:22.043Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvWlJAzOcfh049RHbV",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Cuando llueve es imposible pasar",
    "lat": -35.07418277300659,
    "lng": -57.51224695463862,
    "timestamp": "2026-04-23T18:08:05.589Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvXhKNQrDnoBzTZpRK",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Imposible ir al río por esta calle",
    "lat": -35.03434731670439,
    "lng": -57.50075054145783,
    "timestamp": "2026-04-23T18:12:11.427Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvYsVu0XgzH6equuDY",
    "cats": [
      {
        "icon": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      }
    ],
    "description": "Me encanta ir al rio pero no puedo hacerlo porque no hay luces. No se puede disfrutar de nuestro bello paisaje sino tenes auto",
    "lat": -35.03428010980645,
    "lng": -57.506861425728054,
    "timestamp": "2026-04-23T18:17:26.028Z",
    "status": "Pendiente",
    "contactName": "Anibal",
    "contactInfo": null
  },
  {
    "originalId": "-OqvZCYqm6U5gm3nGVKf",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "necesitamos una bicisenda. Vivimos en el balneario, nadie nos escucha. Es un peligro. Hacemos los mandados en bici o caminando porque tampoco tenemos transporte. Gracias EPA!",
    "lat": -35.0368797889913,
    "lng": -57.50776138034721,
    "timestamp": "2026-04-23T18:18:52.232Z",
    "status": "Pendiente",
    "contactName": "Ornela",
    "contactInfo": null
  },
  {
    "originalId": "-OqvZS044taU2gAh23aQ",
    "cats": [
      {
        "icon": "💧",
        "id": "agua",
        "name": "Sin red de agua potable"
      }
    ],
    "description": "No tenemos agua potable. Kilometros caminando para poder traer unos bidones. Años reclamando.",
    "lat": -35.03103079413209,
    "lng": -57.506582256022924,
    "timestamp": "2026-04-23T18:19:55.543Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvZec2oeIo2e2CjBGF",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "Necesitamos transporte. Ir a trabajar, los chicos, el medico con 50 mil pesos en taxi o a dedo o en bici.",
    "lat": -35.0316796088758,
    "lng": -57.50612514350872,
    "timestamp": "2026-04-23T18:20:51.286Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqv_4PYBTy1y3yG2IPy",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Marque aca porque no encontre calle las higueras. Mis hijos sin ir a la escuela porque por sin luvia el transporte escolar no pasa.",
    "lat": -35.02261413149426,
    "lng": -57.534264133177516,
    "timestamp": "2026-04-23T18:22:41.014Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqv_NR6q4sYkLWMw2a3",
    "cats": [
      {
        "icon": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "no se puede subir ni con un cochecito",
    "lat": -35.08038081137558,
    "lng": -57.51705954707694,
    "timestamp": "2026-04-23T18:23:58.938Z",
    "status": "Pendiente",
    "contactName": "Walter",
    "contactInfo": null
  },
  {
    "originalId": "-Oqv_fZ-_CoCK69HA-gP",
    "cats": [
      {
        "icon": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      }
    ],
    "description": "Los famosos lotes nunca mas pero nos dejaron las calles explotadas",
    "lat": -35.072446399728065,
    "lng": -57.508385640811646,
    "timestamp": "2026-04-23T18:25:17.267Z",
    "status": "Pendiente",
    "contactName": "ANA",
    "contactInfo": null
  },
  {
    "originalId": "-Oqva3I3eXk_bwt0S8L-",
    "cats": [
      {
        "icon": "🗑️",
        "id": "basura",
        "name": "Basura acumulada"
      },
      {
        "icon": "🌊",
        "id": "zanja",
        "name": "Zanja en mal estado"
      },
      {
        "icon": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      }
    ],
    "description": "Salen las ratas de la zanja. Un olor que no se puede estar.",
    "lat": -35.07512184883209,
    "lng": -57.52600166256518,
    "timestamp": "2026-04-23T18:26:58.582Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvaKCqr6kkcBoXBsA9",
    "cats": [
      {
        "icon": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "no se puede subir ni a la vereda. Va directamente no hay veredas",
    "lat": -35.07541590873248,
    "lng": -57.523915445193424,
    "timestamp": "2026-04-23T18:28:07.881Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvagzeEmO3BkuZVTvb",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "hay que caminar en la calle o directamente entre los pastos porque LA VEREDA NO EXISTE",
    "lat": -35.08037003335475,
    "lng": -57.511114668574265,
    "timestamp": "2026-04-23T18:29:45.276Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvawvNZoMsi5fjYVNR",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "Vereda en muy mal estado. Mi abuelo vive en esa esquina para poder hacerlo caminar tenemos que hacer malabares",
    "lat": -35.081285904933566,
    "lng": -57.5117447340364,
    "timestamp": "2026-04-23T18:30:50.539Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvbPiV3RA2bqrNn7Az",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "Es necesario control urbano en el acceso del crim o por lo menos una pasada todo el tiempo con miedo a atropellar a alguien.",
    "lat": -35.083654846725764,
    "lng": -57.50394432724315,
    "timestamp": "2026-04-23T18:32:52.595Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvbZXPYZjGsMWTHGII",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "Los chicos de la escuela salen sin mirar. Es importante control urbano a las 17hs.",
    "lat": -35.08240804084513,
    "lng": -57.51082183870249,
    "timestamp": "2026-04-23T18:33:32.780Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvcGUbJyoZQ05bT1jV",
    "cats": [
      {
        "icon": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "un peligro",
    "lat": -35.078420746399566,
    "lng": -57.52241779410414,
    "timestamp": "2026-04-23T18:36:36.921Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvcQZaHwMmMXUZqtnG",
    "cats": [
      {
        "icon": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "quiero poder circular",
    "lat": -35.078921307569054,
    "lng": -57.520133688593646,
    "timestamp": "2026-04-23T18:37:18.201Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvdSTJ6McfB_KkBroC",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "No se si es generalizado o que pero la cantidad de moscas que hay es impresionante. Hay algun basurero? que esta pasando?",
    "lat": -35.076640129192874,
    "lng": -57.511755118033555,
    "timestamp": "2026-04-23T18:41:48.134Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvdjvqXESp4k0qjTE-",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "No se si es el lugar pero necesito un alquiler no hay nadie. El intendente dice que de eso no se ocupa.",
    "lat": -35.0794388038435,
    "lng": -57.524157523512116,
    "timestamp": "2026-04-23T18:43:03.753Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvejQHkZdle4v1oAPv",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "seguramente ya saben pero hay mucha inseguridad todos hacen vista gorda hasta que pase algo complicado",
    "lat": -35.26741315600608,
    "lng": -57.574880849299575,
    "timestamp": "2026-04-23T18:47:23.812Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvewqBkq08XQFr_FcC",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "No tenemos un buen sistema de transporte y hacemos dedo pero en condiciones horribles. Ojala se pueda instalar algo al menos un techo.",
    "lat": -35.28009512018514,
    "lng": -57.575869540477456,
    "timestamp": "2026-04-23T18:48:18.782Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqvf89odVqvGw7Aqi0B",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "estoy desesperada buscando alquiler",
    "lat": -35.26936744231983,
    "lng": -57.57192348620758,
    "timestamp": "2026-04-23T18:49:09.254Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqvfk0kAMsSXC8CWoax",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "esperar para ir a trabajar es inhumano bajo el sol, la lluvia, imposible.",
    "lat": -35.090301715690416,
    "lng": -57.51613160676839,
    "timestamp": "2026-04-23T18:51:48.419Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx1GEWOTEJciLb0d9X",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "",
    "lat": -35.09159340525445,
    "lng": -57.50688314437867,
    "timestamp": "2026-04-24T01:09:42.021Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx1dIf7jKttNDAaBY3",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      },
      {
        "icon": "💡",
        "id": "luminaria",
        "name": "Luminaria sin funcionamiento"
      }
    ],
    "description": "",
    "lat": -35.06490939557006,
    "lng": -57.51426839146008,
    "timestamp": "2026-04-24T01:11:19.941Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx1dxnPanx0rJpbdbg",
    "cats": [
      {
        "icon": "⚠️",
        "id": "otro",
        "name": "Otro"
      }
    ],
    "description": "Luminaria",
    "lat": -35.07474954376924,
    "lng": -57.51688241958618,
    "timestamp": "2026-04-24T01:11:23.535Z",
    "status": "Pendiente",
    "contactName": "Cami",
    "contactInfo": null
  },
  {
    "originalId": "-Oqx1h9CuVqY-KOOo4Pl",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "",
    "lat": -35.0845615273217,
    "lng": -57.51350212074299,
    "timestamp": "2026-04-24T01:11:36.435Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx1sY6QFWWW3lLy0ea",
    "cats": [
      {
        "icon": "💡",
        "id": "luminaria",
        "name": "Luminaria sin funcionamiento"
      },
      {
        "icon": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      },
      {
        "icon": "🪣",
        "id": "tacho",
        "name": "Sin tacho de basura"
      }
    ],
    "description": "no tenemos iluminación en nuestra manzana",
    "lat": -35.0821521,
    "lng": -57.4941765,
    "timestamp": "2026-04-24T01:12:23.176Z",
    "status": "Pendiente",
    "contactName": "Micaela Borosuky",
    "contactInfo": "borosukymicaela8@gmail.com"
  },
  {
    "originalId": "-Oqx2Laeo7zSAcJ9PaD1",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "No sé puede entrar ni salir del pueblo",
    "lat": -35.26738122323863,
    "lng": -57.56656765937806,
    "timestamp": "2026-04-24T01:14:25.111Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx45nfyEgXmo7aDG_T",
    "cats": [
      {
        "icon": "🗑️",
        "id": "basura",
        "name": "Basura acumulada"
      }
    ],
    "description": "Escombros en la calle",
    "lat": -35.08406189971279,
    "lng": -57.50052966177464,
    "timestamp": "2026-04-24T01:22:05.857Z",
    "status": "Pendiente",
    "contactName": "Jose",
    "contactInfo": null
  },
  {
    "originalId": "-Oqx4lg0NgcsubYjev4m",
    "cats": [
      {
        "icon": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      }
    ],
    "description": "Calle destrozada y sin armar",
    "lat": -35.08381510681345,
    "lng": -57.51059532165528,
    "timestamp": "2026-04-24T01:25:01.488Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx5nMvWHlob4RG0oHr",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Hay una calle de pasto en donde dejaron escombro de la obra de cordon cuneta",
    "lat": -35.08639200347611,
    "lng": -57.503789402390176,
    "timestamp": "2026-04-24T01:29:33.237Z",
    "status": "Pendiente",
    "contactName": "jose",
    "contactInfo": null
  },
  {
    "originalId": "-OqxunlikOndhPeDtZjK",
    "cats": [
      {
        "icon": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Rampas mal hecha",
    "lat": -35.08309910966426,
    "lng": -57.51112002879382,
    "timestamp": "2026-04-24T05:16:43.685Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqzR-4JPhzmvQZ-bfyQ",
    "cats": [
      {
        "icon": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      }
    ],
    "description": "",
    "lat": -35.07722896666451,
    "lng": -57.49686241149903,
    "timestamp": "2026-04-24T12:21:21.782Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqzSA2JTWMKBh2AU1ac",
    "cats": [
      {
        "icon": "🕳️",
        "id": "calle",
        "name": "Calle en mal estado"
      }
    ],
    "description": "",
    "lat": -35.091020281609424,
    "lng": -57.50942587852479,
    "timestamp": "2026-04-24T12:26:28.055Z",
    "status": "Pendiente",
    "contactName": null,
    "contactInfo": null
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-migrate-secret'] !== MIGRATE_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  let ok = 0, err = 0;
  const errors = [];

  for (const r of REPORTS) {
    try {
      await db.collection('reports').add({
        cats: r.cats || [],
        description: r.description || '',
        lat: r.lat,
        lng: r.lng,
        timestamp: r.timestamp || new Date().toISOString(),
        status: r.status || 'Pendiente',
        contactName: r.contactName || null,
        contactInfo: r.contactInfo || null,
        migratedFrom: r.originalId || null
      });
      ok++;
    } catch(e) {
      err++;
      errors.push(e.message);
    }
  }

  return res.status(200).json({ ok: true, migrated: ok, errors: err, errorDetails: errors });
}

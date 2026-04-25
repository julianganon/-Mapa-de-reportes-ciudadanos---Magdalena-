import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

si (!getApps().length) {
  inicializarAplicación({
    credencial: certificado({
      projectId: process.env.FIREBASE_PROJECT_ID,
      Correo electrónico del cliente: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// Clave secreta para proteger este endpoint
const MIGRATE_SECRET = process.env.MIGRATE_SECRET;

const INFORMES =
[
  {
    "originalId": "-OquhKUnUzPSkqmbAJZk",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Mal estado con o sin lluvia",
    "lat": -35.26788697984361,
    "lng": -57.57715111967628,
    "marca de tiempo": "2026-04-23T14:19:00.221Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqui1eSt6L0FAunwF4N",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      },
      {
        "icono": "🌊",
        "id": "zanja",
        "name": "Zanja en mal estado"
      }
    ],
    "description": "El cordón se llena de aguas servidas y hace 7 meses no pasan a limpiarlo se acumula pudrición",
    "lat": -35.0724029,
    "lng": -57.5218861,
    "marca de tiempo": "2026-04-23T14:22:05.371Z",
    "estado": "Pendiente",
    "contactName": "Antonella Sánchez",
    "contactInfo": "joaquinludue6@gmail.com"
  },
  {
    "originalId": "-OquinGdx3sFCGFn0peY",
    "gatos": [
      {
        "icono": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Tengo que ir a buscar a mi hija a la escuela y no puedo con la silla de ruedas",
    "lat": -35.08206711514824,
    "lng": -57.5118081830442,
    "marca de tiempo": "2026-04-23T14:25:24.256Z",
    "estado": "Pendiente",
    "contactName": "Lucas",
    "contactInfo": null
  },
  {
    "originalId": "-Oquiv-JmUZkaxrxneOr",
    "gatos": [
      {
        "icono": "💡",
        "id": "luminaria",
        "name": "Luminaria sin funcionamiento"
      },
      {
        "icono": "🌊",
        "id": "zanja",
        "name": "Zanja en mal estado"
      }
    ],
    "description": "Colocaron las luces el año pasado y se rompieron en menos de un mes, se hizo el reclamo y no volvieron a arreglar",
    "lat": -35.0769948,
    "lng": -57.5032379,
    "marca de tiempo": "2026-04-23T14:25:55.086Z",
    "estado": "Pendiente",
    "contactName": "Naza",
    "contactInfo": null
  },
  {
    "originalId": "-Oquj7XzHNHQVjHIjcjE",
    "gatos": [
      {
        "icono": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Está muy alto, no se puede subir",
    "lat": -35.08055559570559,
    "lng": -57.51619416465474,
    "marca de tiempo": "2026-04-23T14:26:51.465Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oquj7hPZgW1a7uGWUu5",
    "gatos": [
      {
        "icono": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Quiero ir al correo y es imposible. Es toda la manzana",
    "lat": -35.07927366480112,
    "lng": -57.51795262098313,
    "marca de tiempo": "2026-04-23T14:26:52.058Z",
    "estado": "Pendiente",
    "contactName": "Agustín",
    "contactInfo": null
  },
  {
    "originalId": "-OqujAy2T8RD_UVs4ch-",
    "gatos": [
      {
        "icono": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      }
    ],
    "description": "Falta luminaria en una cuadra. Sobre calle Dr Illia, desde Las Carretas hasta Crl.Pringles.",
    "lat": -35.08904500359438,
    "lng": -57.50031352081351,
    "marca de tiempo": "2026-04-23T14:27:05.251Z",
    "estado": "Pendiente",
    "contactName": "Marcelo",
    "contactInfo": "2221412007"
  },
  {
    "originalId": "-OqujCnJtO5ZggjFYdUY",
    "gatos": [
      {
        "icono": "🗑️",
        "id": "basura",
        "name": "Basura acumulada"
      }
    ],
    "descripción": "Hfh",
    "lat": -35.08204683642798,
    "lng": -57.507355380803354,
    "marca de tiempo": "2026-04-23T14:27:12.590Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqujGQNKISqwNZPRoSZ",
    "gatos": [
      {
        "icono": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Quiero ir al anses y es imposible. Es toda la manzana",
    "lat": -35.07894118759401,
    "lng": -57.51903254538775,
    "marca de tiempo": "2026-04-23T14:27:27.767Z",
    "estado": "Pendiente",
    "contactName": "Alicia",
    "contactInfo": null
  },
  {
    "originalId": "-OqujPH-qc_-OeNX7cJG",
    "gatos": [
      {
        "icono": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Un organismo provincial y la rampa hecha así nomas. Una vergüenza.",
    "lat": -35.08292235121745,
    "lng": -57.51865804195405,
    "marca de tiempo": "2026-04-23T14:28:04.032Z",
    "estado": "Pendiente",
    "contactName": "Luisa",
    "contactInfo": null
  },
  {
    "originalId": "-Oquj_hVEcK893ZQ80II",
    "gatos": [
      {
        "icono": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      }
    ],
    "description": "Empezo la obra. Me encanta pero como comerciante me esta matando. No se si puedo aguantar.",
    "lat": -35.08125696948397,
    "lng": -57.517229598015554,
    "marca de tiempo": "2026-04-23T14:28:50.847Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqujfu8isI2CXZn6oQI",
    "gatos": [
      {
        "icono": "🔧",
        "id": "cloaca",
        "nombre": "Sin cloaca"
      },
      {
        "icono": "💧",
        "id": "agua",
        "name": "Sin rojo de agua potable"
      },
      {
        "icono": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      }
    ],
    "descripción": "",
    "lat": -35.09137832683922,
    "lng": -57.507714629173286,
    "marca de tiempo": "2026-04-23T14:29:16.045Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqujnvNfMiJoTGhR3cF",
    "gatos": [
      {
        "icono": "🪣",
        "id": "tacho",
        "name": "Sin tacho de basura"
      }
    ],
    "descripción": "",
    "lat": -35.090105402156524,
    "lng": -57.50986576080323,
    "marca de tiempo": "2026-04-23T14:29:48.894Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqukVHHGYM3zm5GrBQX",
    "gatos": [
      {
        "icono": "💡",
        "id": "luminaria",
        "name": "Luminaria sin funcionamiento"
      }
    ],
    "description": "La luz hace semanas que no anda. Una boca de lobo.",
    "lat": -35.080899083447946,
    "lng": -57.51030564308167,
    "marca de tiempo": "2026-04-23T14:32:50.758Z",
    "estado": "Pendiente",
    "contactName": "Antonela",
    "contactInfo": null
  },
  {
    "originalId": "-Oqum6cYp4bw4s4bBQIo",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Calle viamonte entre araldi y la ruta de atalaya intransitable los posos tremendo y cuando llueve ni hablar .solo pasar la maquina no lo soluciona . Misma calle tiene la mitad del sajeo y donde hay sanja los palos de la luz están a punto de caerse . Ya hice la denuncia en edelap ni pelota me dieron",
    "lat": -35.06789240863436,
    "lng": -57.518727779388435,
    "marca de tiempo": "2026-04-23T14:39:54.059Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqunJQ9vwVzOxyTXgJH",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      },
      {
        "icono": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      },
      {
        "icono": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      },
      {
        "icono": "🪣",
        "id": "tacho",
        "name": "Sin tacho de basura"
      }
    ],
    "description": "Calles de barro y llena de agua \nNo hay iluminaria \nEl contenedor está a 2 cuadras",
    "lat": -35.07500722969832,
    "lng": -57.53040075302125,
    "marca de tiempo": "2026-04-23T14:45:08.054Z",
    "estado": "Pendiente",
    "contactName": "Agus",
    "contactInfo": "aagustebaldi@gmail.com"
  },
  {
    "originalId": "-OquoQPZsSxFPtadzs1S",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Se asfalto la calle hace algunos años pero ya se hizo un pozo que no solo la hace intransitable para los vecinos sino peligroso porque los autos pasan y levantan pedazos de asfalto.",
    "lat": -35.07969604788894,
    "lng": -57.75048993384652,
    "marca de tiempo": "2026-04-23T14:49:59.370Z",
    "estado": "Pendiente",
    "contactName": "Agustina y familia",
    "contactInfo": null
  },
  {
    "originalId": "-OqupOfKLsE6xt9o7gfx",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "Tenemos asfalto hace algunos años y ahora parece una autopista. Necesitaríamos un lomo de burro o reductor de velocidad.",
    "lat": -35.0811142860173,
    "lng": -57.75084549890929,
    "marca de tiempo": "2026-04-23T14:54:14.408Z",
    "estado": "Pendiente",
    "contactName": "Morena",
    "contactInfo": null
  },
  {
    "originalId": "-OqupU3CfIqgiARyucxa",
    "gatos": [
      {
        "icono": "💧",
        "id": "agua",
        "name": "Sin rojo de agua potable"
      }
    ],
    "description": "Somos todos una cuadra que no tiene red de agua ni cloaca, esperemos se pueda subsanar por qué es un tema esencial y el agua no puede faltar.",
    "lat": -35.079459280788605,
    "lng": -57.49994518761469,
    "marca de tiempo": "2026-04-23T14:54:36.431Z",
    "estado": "Pendiente",
    "contactName": "Jan",
    "contactInfo": "janomorales36@gmail.com"
  },
  {
    "originalId": "-Oqurn25yp_cGMGBVRYZ",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      },
      {
        "icono": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      },
      {
        "icono": "🪣",
        "id": "tacho",
        "name": "Sin tacho de basura"
      }
    ],
    "description": "La calle está toda pozeada, no hay luminarias ni tampoco contenedores en una de las esquinas se junta basura",
    "lat": -35.078552091827525,
    "lng": -57.50464138000994,
    "marca de tiempo": "2026-04-23T15:04:42.545Z",
    "estado": "Pendiente",
    "contactName": "Magali",
    "contactInfo": "02214092214"
  },
  {
    "originalId": "-Oquxf5B-AdRn__4aTUz",
    "gatos": [
      {
        "icono": "🗑️",
        "id": "basura",
        "name": "Basura acumulada"
      }
    ],
    "description": "Quisiera reclamar al municipio, que lave los contenedores de basura, frente al hospital no se puede vivir por la cantidad de moscas y el olor a los contenedores, por favor que alguien se ocupe, desde ya muchas gracias ! .",
    "lat": -35.07671693286925,
    "lng": -57.50822531234009,
    "marca de tiempo": "2026-04-23T15:30:25.259Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqv3wIZBm4YufkfNA1g",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Raices de arboles muy grandes afectado el paso sobre la vereda",
    "lat": -35.08030576039966,
    "lng": -57.51588249209818,
    "marca de tiempo": "2026-04-23T16:02:07.726Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqv8p-x-ws68iY226Q1",
    "gatos": [
      {
        "icono": "🌊",
        "id": "zanja",
        "name": "Zanja en mal estado"
      }
    ],
    "description": "La sanja es un azco. Olor todo el tiempo. Hay bichos.",
    "lat": -35.09280222958983,
    "lng": -57.522697448730476,
    "marca de tiempo": "2026-04-23T16:23:27.766Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvBF-QeTwACKCaqtKT",
    "gatos": [
      {
        "icono": "🌊",
        "id": "zanja",
        "name": "Zanja en mal estado"
      }
    ],
    "description": "Hace meses hicimos el reclamo con los vecinos. Somos de empalme. Nadie nos escucha espero que ustedes si. En la ubicación pongo empalme y marco cualquiera perp la real es 108 entre 12 y 13",
    "lat": -35.06631000538759,
    "lng": -57.53856875002385,
    "marca de tiempo": "2026-04-23T16:34:04.078Z",
    "estado": "Pendiente",
    "contactName": "Roberto",
    "contactInfo": null
  },
  {
    "originalId": "-OqvVuj0HmJGfMgh3nah",
    "gatos": [
      {
        "icono": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      }
    ],
    "description": "Es una boca de lobo",
    "lat": -35.2695492975905,
    "lng": -57.57390832864986,
    "marca de tiempo": "2026-04-23T18:04:22.043Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvWlJAzOcfh049RHbV",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Cuando llueve es imposible pasar",
    "lat": -35.07418277300659,
    "lng": -57.51224695463862,
    "marca de tiempo": "2026-04-23T18:08:05.589Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvXhKNQrDnoBzTZpRK",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Imposible ir al río por esta calle",
    "lat": -35.03434731670439,
    "lng": -57.50075054145783,
    "marca de tiempo": "2026-04-23T18:12:11.427Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvYsVu0XgzH6equuDY",
    "gatos": [
      {
        "icono": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      }
    ],
    "description": "Me encanta ir al rio pero no puedo hacerlo porque no hay luces. No se puede disfrutar de nuestro hermoso paisaje sino tenes auto",
    "lat": -35.03428010980645,
    "lng": -57.506861425728054,
    "marca de tiempo": "2026-04-23T18:17:26.028Z",
    "estado": "Pendiente",
    "contactName": "Aníbal",
    "contactInfo": null
  },
  {
    "originalId": "-OqvZCYqm6U5gm3nGVKf",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "necesitamos una bicicleta. Vivimos en el balneario, nadie nos escucha. Es un peligro. Hacemos los mandados en bicicleta o caminando porque tampoco tenemos transporte. ¡Gracias EPA!",
    "lat": -35.0368797889913,
    "lng": -57.50776138034721,
    "marca de tiempo": "2026-04-23T18:18:52.232Z",
    "estado": "Pendiente",
    "contactName": "Ornela",
    "contactInfo": null
  },
  {
    "originalId": "-OqvZS044taU2gAh23aQ",
    "gatos": [
      {
        "icono": "💧",
        "id": "agua",
        "name": "Sin rojo de agua potable"
      }
    ],
    "description": "No tenemos agua potable. Kilometros caminando para poder traer unos bidones. Años reclamando.",
    "lat": -35.03103079413209,
    "lng": -57.506582256022924,
    "marca de tiempo": "2026-04-23T18:19:55.543Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvZec2oeIo2e2CjBGF",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "Necesitamos transporte. Ir a trabajar, los chicos, el médico con 50 mil pesos en taxi oa dedo o en bicicleta.",
    "lat": -35.0316796088758,
    "lng": -57.50612514350872,
    "marca de tiempo": "2026-04-23T18:20:51.286Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqv_4PYBTy1y3yG2IPy",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Marque aca porque no encontre calle las higueras. Mis hijos sin ir a la escuela porque por sin luvia el transporte escolar no pasa.",
    "lat": -35.02261413149426,
    "lng": -57.534264133177516,
    "marca de tiempo": "2026-04-23T18:22:41.014Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqv_NR6q4sYkLWMw2a3",
    "gatos": [
      {
        "icono": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "no se puede subir ni con un cochecito de bebé",
    "lat": -35.08038081137558,
    "lng": -57.51705954707694,
    "marca de tiempo": "2026-04-23T18:23:58.938Z",
    "estado": "Pendiente",
    "contactName": "Walter",
    "contactInfo": null
  },
  {
    "originalId": "-Oqv_fZ-_CoCK69HA-gP",
    "gatos": [
      {
        "icono": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      }
    ],
    "description": "Los famosos lotes nunca mas pero nos dejaron las calles explotadas",
    "lat": -35.072446399728065,
    "lng": -57.508385640811646,
    "marca de tiempo": "2026-04-23T18:25:17.267Z",
    "estado": "Pendiente",
    "contactName": "ANA",
    "contactInfo": null
  },
  {
    "originalId": "-Oqva3I3eXk_bwt0S8L-",
    "gatos": [
      {
        "icono": "🗑️",
        "id": "basura",
        "name": "Basura acumulada"
      },
      {
        "icono": "🌊",
        "id": "zanja",
        "name": "Zanja en mal estado"
      },
      {
        "icono": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      }
    ],
    "description": "Salen las ratas de la zanja. Un olor que no se puede estar.",
    "lat": -35.07512184883209,
    "lng": -57.52600166256518,
    "marca de tiempo": "2026-04-23T18:26:58.582Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvaKCqr6kkcBoXBsA9",
    "gatos": [
      {
        "icono": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "no se puede subir ni a la vereda. Va directamente no hay veredas",
    "lat": -35.07541590873248,
    "lng": -57.523915445193424,
    "marca de tiempo": "2026-04-23T18:28:07.881Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvagzeEmO3BkuZVTvb",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "hay que caminar en la calle o directamente entre los pastos porque LA VEREDA NO EXISTE",
    "lat": -35.08037003335475,
    "lng": -57.511114668574265,
    "marca de tiempo": "2026-04-23T18:29:45.276Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvawvNZoMsi5fjYVNR",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "Vereda en muy mal estado. Mi abuelo vive en esa esquina para poder hacerlo caminar tenemos que hacer malabares",
    "lat": -35.081285904933566,
    "lng": -57.5117447340364,
    "marca de tiempo": "2026-04-23T18:30:50.539Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvbPiV3RA2bqrNn7Az",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "Es necesario control urbano en el acceso del crim o por lo menos una pasada todo el tiempo con miedo a atropellar a alguien.",
    "lat": -35.083654846725764,
    "lng": -57.50394432724315,
    "marca de tiempo": "2026-04-23T18:32:52.595Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvbZXPYZjGsMWTHGII",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "Los chicos de la escuela salen sin mirar. Es importante control urbano a las 17hs.",
    "lat": -35.08240804084513,
    "lng": -57.51082183870249,
    "marca de tiempo": "2026-04-23T18:33:32.780Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvcGUbJyoZQ05bT1jV",
    "gatos": [
      {
        "icono": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "un peligro",
    "lat": -35.078420746399566,
    "lng": -57.52241779410414,
    "marca de tiempo": "2026-04-23T18:36:36.921Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvcQZaHwMmMXUZqtnG",
    "gatos": [
      {
        "icono": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "quiero poder circular",
    "lat": -35.078921307569054,
    "lng": -57.520133688593646,
    "marca de tiempo": "2026-04-23T18:37:18.201Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvdSTJ6McfB_KkBroC",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "No se si es generalizado o que pero la cantidad de moscas que hay es impresionante. ¿Hay algun basurero? que esta pasando?",
    "lat": -35.076640129192874,
    "lng": -57.511755118033555,
    "marca de tiempo": "2026-04-23T18:41:48.134Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvdjvqXESp4k0qjTE-",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "No se si es el lugar pero necesito un alquiler no hay nadie. El intendente dice que de eso no se ocupa.",
    "lat": -35.0794388038435,
    "lng": -57.524157523512116,
    "marca de tiempo": "2026-04-23T18:43:03.753Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvejQHkZdle4v1oAPv",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "seguramente ya saben pero hay mucha inseguridad todos hacen vista gorda hasta que pase algo complicado",
    "lat": -35.26741315600608,
    "lng": -57.574880849299575,
    "marca de tiempo": "2026-04-23T18:47:23.812Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqvewqBkq08XQFr_FcC",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "No tenemos un buen sistema de transporte y hacemos dedo pero en condiciones horribles. Ojala se pueda instalar algo al menos un techo.",
    "lat": -35.28009512018514,
    "lng": -57.575869540477456,
    "marca de tiempo": "2026-04-23T18:48:18.782Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqvf89odVqvGw7Aqi0B",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "estoy desesperada buscando alquiler",
    "lat": -35.26936744231983,
    "lng": -57.57192348620758,
    "marca de tiempo": "2026-04-23T18:49:09.254Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqvfk0kAMsSXC8CWoax",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "description": "esperar para ir a trabajar es inhumano bajo el sol, la lluvia, imposible.",
    "lat": -35.090301715690416,
    "lng": -57.51613160676839,
    "marca de tiempo": "2026-04-23T18:51:48.419Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx1GEWOTEJciLb0d9X",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "descripción": "",
    "lat": -35.09159340525445,
    "lng": -57.50688314437867,
    "marca de tiempo": "2026-04-24T01:09:42.021Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx1dIf7jKttNDAaBY3",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      },
      {
        "icono": "💡",
        "id": "luminaria",
        "name": "Luminaria sin funcionamiento"
      }
    ],
    "descripción": "",
    "lat": -35.06490939557006,
    "lng": -57.51426839146008,
    "marca de tiempo": "2026-04-24T01:11:19.941Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx1dxnPanx0rJpbdbg",
    "gatos": [
      {
        "icono": "⚠️",
        "id": "otro",
        "nombre": "Otro"
      }
    ],
    "descripción": "Luminaria",
    "lat": -35.07474954376924,
    "lng": -57.51688241958618,
    "marca de tiempo": "2026-04-24T01:11:23.535Z",
    "estado": "Pendiente",
    "contactName": "Cami",
    "contactInfo": null
  },
  {
    "originalId": "-Oqx1h9CuVqY-KOOo4Pl",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "descripción": "",
    "lat": -35.0845615273217,
    "lng": -57.51350212074299,
    "marca de tiempo": "2026-04-24T01:11:36.435Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx1sY6QFWWW3lLy0ea",
    "gatos": [
      {
        "icono": "💡",
        "id": "luminaria",
        "name": "Luminaria sin funcionamiento"
      },
      {
        "icono": "🔦",
        "id": "faltlum",
        "name": "Falta de luminaria"
      },
      {
        "icono": "🪣",
        "id": "tacho",
        "name": "Sin tacho de basura"
      }
    ],
    "description": "no tenemos iluminación en nuestra manzana",
    "lat": -35.0821521,
    "lng": -57.4941765,
    "marca de tiempo": "2026-04-24T01:12:23.176Z",
    "estado": "Pendiente",
    "contactName": "Micaela Borosuky",
    "contactInfo": "borosukymicaela8@gmail.com"
  },
  {
    "originalId": "-Oqx2Laeo7zSAcJ9PaD1",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "description": "No sé puede entrar ni salir del pueblo",
    "lat": -35.26738122323863,
    "lng": -57.56656765937806,
    "marca de tiempo": "2026-04-24T01:14:25.111Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx45nfyEgXmo7aDG_T",
    "gatos": [
      {
        "icono": "🗑️",
        "id": "basura",
        "name": "Basura acumulada"
      }
    ],
    "description": "Escombros en la calle",
    "lat": -35.08406189971279,
    "lng": -57.50052966177464,
    "marca de tiempo": "2026-04-24T01:22:05.857Z",
    "estado": "Pendiente",
    "contactName": "Jose",
    "contactInfo": null
  },
  {
    "originalId": "-Oqx4lg0NgcsubYjev4m",
    "gatos": [
      {
        "icono": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      }
    ],
    "description": "Calle destrozada y sin armar",
    "lat": -35.08381510681345,
    "lng": -57.51059532165528,
    "marca de tiempo": "2026-04-24T01:25:01.488Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-Oqx5nMvWHlob4RG0oHr",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "description": "Hay una calle de pasto en donde dejaron escombro de la obra de cordon cuneta",
    "lat": -35.08639200347611,
    "lng": -57.503789402390176,
    "marca de tiempo": "2026-04-24T01:29:33.237Z",
    "estado": "Pendiente",
    "contactName": "jose",
    "contactInfo": null
  },
  {
    "originalId": "-OqxunlikOndhPeDtZjK",
    "gatos": [
      {
        "icono": "♿",
        "id": "rampa",
        "name": "Rampa en mal estado"
      }
    ],
    "description": "Rampas mal hechas",
    "lat": -35.08309910966426,
    "lng": -57.51112002879382,
    "marca de tiempo": "2026-04-24T05:16:43.685Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqzR-4JPhzmvQZ-bfyQ",
    "gatos": [
      {
        "icono": "🚧",
        "id": "obra",
        "name": "Obra sin terminar"
      }
    ],
    "descripción": "",
    "lat": -35.07722896666451,
    "lng": -57.49686241149903,
    "marca de tiempo": "2026-04-24T12:21:21.782Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  },
  {
    "originalId": "-OqzSA2JTWMKBh2AU1ac",
    "gatos": [
      {
        "icono": "🕳️",
        "id": "llamar",
        "name": "Calle en mal estado"
      }
    ],
    "descripción": "",
    "lat": -35.091020281609424,
    "lng": -57.50942587852479,
    "marca de tiempo": "2026-04-24T12:26:28.055Z",
    "estado": "Pendiente",
    "contactName": null,
    "contactInfo": null
  }
];

export default async function handler(req, res) {
  // Solo POST y solo con el secreto correcto
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-migrate-secret'] !== MIGRATE_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  sea ​​ok = 0, err = 0;
  const errores = [];

  para (constante r de INFORMES) {
    intentar {
      await db.collection('reports').add({
        gatos: r.cats || [],
        descripción: r.descripción || '',
        lat: r.lat,
        lng: r.lng,
        marca de tiempo: r.timestamp || new Date().toISOString(),
        estado: r.status || 'Pendiente',
        contactName: r.contactName || null,
        contactInfo: r.contactInfo || null,
        migradoDesde: r.originalId || null
      });
      ok++;
    } catch(e) {
      err++;
      errores.push(e.message);
    }
  }
  return res.status(200).json({
    ok: verdadero,
       migrado: ok,
    errores: err,
    Detalles del error: errores
  });
}

import type { McParkMod } from "../utils/mcpark-parser";

export const PACK_MODS: McParkMod[] = [
  {
    "id": "balm",
    "name": "Balm",
    "version": "26.1.2-26",
    "required": false,
    "category": "library",
    "description": "Abstraction Layer for Multi-Loader Mods",
    "source": "modrinth",
    "projectId": "MBAkmtvl",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "midnightlib",
    "name": "MidnightLib",
    "version": "1.9.3+26",
    "required": false,
    "category": "library",
    "description": "Common library providing a lightweight configuration system",
    "source": "modrinth",
    "projectId": "codAaoxh",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "cloth-config",
    "name": "Cloth Config API",
    "version": "26.1.154",
    "required": false,
    "category": "library",
    "description": "Configuration Library for Minecraft Mods",
    "source": "modrinth",
    "projectId": "9s6osm5g",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "moreculling",
    "name": "More Culling",
    "version": "26.1.2-1",
    "required": false,
    "category": "performance",
    "description": "A mod that changes how multiple types of culling are handled in order to improve performance",
    "source": "modrinth",
    "projectId": "51shyZVL",
    "dependencies": [
      "cloth-config"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "fabric-language-kotlin",
    "name": "Fabric Language Kotlin",
    "version": "1.13.12+kotlin",
    "required": false,
    "category": "library",
    "description": "This is a mod that enables usage of the Kotlin programming language for Fabric mods.",
    "source": "modrinth",
    "projectId": "Ha28R6CL",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "reeses-sodium-options",
    "name": "Reese's Sodium Options",
    "version": "2.0.5+mc26",
    "required": false,
    "category": "performance",
    "description": "Alternative Options Menu for Sodium",
    "source": "modrinth",
    "projectId": "Bh37bMuy",
    "dependencies": [
      "sodium"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "servux",
    "name": "Servux",
    "version": "26.1.2-0",
    "required": false,
    "category": "other",
    "description": "Servux is a server-side mod that provides support for some client-side mods, such as sending structure bounding boxes for MiniHUD",
    "source": "modrinth",
    "projectId": "zQhsx8KF",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "appleskin",
    "name": "AppleSkin",
    "version": "26.1.2-3",
    "required": false,
    "category": "ui",
    "description": "Food/hunger-related HUD improvements",
    "source": "modrinth",
    "projectId": "EsAfCjCV",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "particle-rain",
    "name": "Particle Rain",
    "version": "4.0.0-beta",
    "required": false,
    "category": "visual",
    "description": "Replaces weather with prettier particle effects",
    "source": "modrinth",
    "projectId": "nrikgvxm",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "better-block-entities",
    "name": "Better Block Entities",
    "version": "1.3.4+mc26",
    "required": false,
    "category": "redstone",
    "description": "A Minecraft optimization mod for Fabric-Sodium that improves framerates by improving block entity rendering via a hybrid renderer",
    "source": "modrinth",
    "projectId": "ONZm0H7Y",
    "dependencies": [
      "sodium"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "modmenu",
    "name": "Mod Menu",
    "version": "18.0.0-beta",
    "required": false,
    "category": "ui",
    "description": "Adds a mod menu to view the list of mods you have installed.",
    "source": "modrinth",
    "projectId": "mOgUt4GM",
    "dependencies": [
      "fabric-api",
      "placeholder-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "chunky",
    "name": "Chunky",
    "version": "1.5.3",
    "required": false,
    "category": "performance",
    "description": "Pre-generates chunks, quickly and efficiently",
    "source": "modrinth",
    "projectId": "fALzjamp",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "tweakeroo",
    "name": "Tweakeroo",
    "version": "26.1.2-0",
    "required": false,
    "category": "redstone",
    "description": "Various client-side tweaks, such as hand restock, hotbar swap/cycle, flexible/fast block placement etc.",
    "source": "modrinth",
    "projectId": "t5wuYk45",
    "dependencies": [
      "malilib"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "searchables",
    "name": "Searchables",
    "version": "26.1.2-1",
    "required": false,
    "category": "ui",
    "description": "Searchables is a library mod that adds helper methods that allow for searching and filtering elements based on components, as well as offering built in auto-complete functionality.",
    "source": "modrinth",
    "projectId": "fuuu3xnx",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "tcdcommons",
    "name": "TCDCommons API",
    "version": "5.3.2+fn-26",
    "required": false,
    "category": "ui",
    "description": "TheCSDev's personal library mod for the Minecraft modding environment.",
    "source": "modrinth",
    "projectId": "Eldc1g37",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "e4mc",
    "name": "e4mc",
    "version": "6.1.2-modern",
    "required": false,
    "category": "network",
    "description": "Open a LAN server to anyone, anywhere, anytime.",
    "source": "modrinth",
    "projectId": "qANg5Jrr",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "axiom",
    "name": "Axiom",
    "version": "5.4.2-for-MC26",
    "required": false,
    "category": "building",
    "description": "The all-in-one tool for editing Minecraft Worlds.",
    "source": "modrinth",
    "projectId": "N6n5dqoA",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "yacl",
    "name": "YetAnotherConfigLib (YACL)",
    "version": "3.9.4+26",
    "required": false,
    "category": "library",
    "description": "A builder-based configuration library for Minecraft!",
    "source": "modrinth",
    "projectId": "1eAoo2KR",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "resourcify",
    "name": "Resourcify",
    "version": "1.8.3",
    "required": false,
    "category": "other",
    "description": "In-game resource pack, data pack and shader browser and updater.",
    "source": "modrinth",
    "projectId": "RLzHAoZe",
    "dependencies": [
      "fabric-api",
      "fabric-language-kotlin"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "controlling",
    "name": "Controlling",
    "version": "26.1.2-26",
    "required": false,
    "category": "ui",
    "description": "Adds a search bar to the Key-Bindings menu",
    "source": "modrinth",
    "projectId": "xv94TkTM",
    "dependencies": [
      "searchables",
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "entity-model-features",
    "name": "[EMF] Entity Model Features",
    "version": "3.2.4-26",
    "required": false,
    "category": "visual",
    "description": "EMF is an, OptiFine format, Custom Entity Model replacement mod available for Fabric and Forge.",
    "source": "modrinth",
    "projectId": "4I1XuqiY",
    "dependencies": [
      "entitytexturefeatures"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "capes",
    "name": "Capes",
    "version": "1.5.10+26",
    "required": false,
    "category": "other",
    "description": "Lets you use capes from OptiFine, LabyMod and other cape mods",
    "source": "modrinth",
    "projectId": "89Wsn8GD",
    "dependencies": [
      "fabric-language-kotlin",
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "punchy-fpa",
    "name": "Punchy!",
    "version": "2.5.5-fabric-26",
    "required": false,
    "category": "ui",
    "description": "A mod that adds various first person animations and visible hands with held items!",
    "source": "modrinth",
    "projectId": "8aoMKplv",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "immediatelyfast",
    "name": "ImmediatelyFast",
    "version": "1.15.2+26",
    "required": false,
    "category": "performance",
    "description": "Speed up immediate mode rendering in Minecraft",
    "source": "modrinth",
    "projectId": "5ZwdcRci",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "placeholder-api",
    "name": "Text Placeholder API",
    "version": "3.0.0+26",
    "required": false,
    "category": "library",
    "description": "Placeholder and Text manipulation library for your Minecraft mods.",
    "source": "modrinth",
    "projectId": "eXts2L7r",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "lambdynamiclights",
    "name": "LambDynamicLights - Dynamic Lights",
    "version": "4.11.0+26",
    "required": false,
    "category": "visual",
    "description": "Adds dynamic lights to Minecraft as the most feature-complete and optimized dynamic lighting mod.",
    "source": "modrinth",
    "projectId": "yBW8D80W",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "better-stats",
    "name": "Better Statistics Screen",
    "version": "5.3.0+fn-26",
    "required": false,
    "category": "ui",
    "description": "A Minecraft mod that improves the statistics screen and makes it more useful.",
    "source": "modrinth",
    "projectId": "n6PXGAoM",
    "dependencies": [
      "tcdcommons"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "litematica",
    "name": "Litematica",
    "version": "26.1.2-0",
    "required": false,
    "category": "building",
    "description": "A client-side schematic mod with extra features for creative mode work",
    "source": "modrinth",
    "projectId": "bEpr0Arc",
    "dependencies": [
      "malilib"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "clumps",
    "name": "Clumps",
    "version": "26.1.2-26",
    "required": false,
    "category": "performance",
    "description": "Clumps XP orbs together to reduce lag",
    "source": "modrinth",
    "projectId": "Wnxd13zP",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "dynamiccrosshair",
    "name": "Dynamic Crosshair",
    "version": "latest",
    "required": false,
    "category": "ui",
    "description": "A mod that hides or changes the crosshair dependent on context",
    "source": "modrinth",
    "projectId": "ZcR9weSm",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "voxy",
    "name": "voxy",
    "version": "0.2.16-beta",
    "required": false,
    "category": "visual",
    "description": "A Level of Detail rendering mod",
    "source": "modrinth",
    "projectId": "fxxUqruK",
    "dependencies": [
      "fabric-api",
      "sodium"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "fabric-api",
    "name": "Fabric API",
    "version": "0.152.1+26",
    "required": true,
    "category": "library",
    "description": "Lightweight and modular API providing common hooks and intercompatibility measures utilized by mods using the Fabric toolchain.",
    "source": "modrinth",
    "projectId": "P7dR8mSH",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "litematica-printer",
    "name": "Litematica Printer",
    "version": "26.1.1-3",
    "required": false,
    "category": "redstone",
    "description": "This fork adds the missing printing functionality for Litematica",
    "source": "modrinth",
    "projectId": "3llatzyE",
    "dependencies": [
      "litematica",
      "malilib"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "itemswapper",
    "name": "ItemSwapper",
    "version": "0.10.1-mc26",
    "required": false,
    "category": "redstone",
    "description": "Inventory update concept for hotswapping items.",
    "source": "modrinth",
    "projectId": "RPOSBQgq",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "iris",
    "name": "Iris Shaders",
    "version": "1.10.9+mc26",
    "required": false,
    "category": "visual",
    "description": "A modern shader pack loader for Minecraft intended to be compatible with existing OptiFine shader packs",
    "source": "modrinth",
    "projectId": "YL57xq9U",
    "dependencies": [
      "sodium"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "geckolib",
    "name": "Geckolib",
    "version": "26.1.2-5",
    "required": false,
    "category": "library",
    "description": "A 3D animation library for entities, blocks, items, armor, and more!",
    "source": "modrinth",
    "projectId": "8BmcQJ2H",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "item-scroller",
    "name": "Item Scroller",
    "version": "26.1.2-0",
    "required": false,
    "category": "redstone",
    "description": "A client mod that adds many shortcuts to move items easier and craft faster in inventory screens",
    "source": "modrinth",
    "projectId": "JygyCSA4",
    "dependencies": [
      "malilib"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "fast-ip-ping",
    "name": "Fast IP Ping",
    "version": "1.0.11-mc26",
    "required": false,
    "category": "library",
    "description": "Yeet the laggy reversed DNS lookup for literal IP server addresses",
    "source": "modrinth",
    "projectId": "9mtu0sUO",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "journeymap",
    "name": "JourneyMap",
    "version": "26.1.2-6",
    "required": false,
    "category": "world",
    "description": "Real-time map used for mapping in-game or your browser as you explore.",
    "source": "modrinth",
    "projectId": "lfHFW1mp",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "mcwifipnp",
    "name": "LAN World Plug-n-Play (mcwifipnp)",
    "version": "1.9.8-26",
    "required": false,
    "category": "network",
    "description": "LAN World Plug-n-Play (mcwifipnp)",
    "source": "modrinth",
    "projectId": "RTWpcTBp",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "continuity",
    "name": "Continuity",
    "version": "3.0.1-beta",
    "required": false,
    "category": "other",
    "description": "A Minecraft mod that allows for efficient connected textures",
    "source": "modrinth",
    "projectId": "1IjD5062",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "flashback",
    "name": "Flashback",
    "version": "0.40.0-for-MC26",
    "required": false,
    "category": "other",
    "description": "Record your Minecraft gameplay, play it back and create stunning cinematic shots",
    "source": "modrinth",
    "projectId": "4das1Fjq",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "justenoughcharacters",
    "name": "JustEnoughCharacters",
    "version": "26.1.2-fabric-4",
    "required": false,
    "category": "visual",
    "description": "A tweak to many mods to search in Chinese Pinyin。",
    "source": "modrinth",
    "projectId": "I7k4B65h",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "entitytexturefeatures",
    "name": "[ETF] Entity Texture Features",
    "version": "latest",
    "required": false,
    "category": "visual",
    "description": "Emissive, Random & Custom texture support for entities in resourcepacks just like Optifine but for Fabric",
    "source": "modrinth",
    "projectId": "BVzZfTc1",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "minihud",
    "name": "MiniHUD",
    "version": "26.1.2-0",
    "required": false,
    "category": "redstone",
    "description": "A \"mini F3\" HUD mod, also with various overlays like light level, spawn chunks, slime chunks etc.",
    "source": "modrinth",
    "projectId": "UMxybHE8",
    "dependencies": [
      "malilib"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "sound",
    "name": "Sounds",
    "version": "2.5.0+lts+26",
    "required": false,
    "category": "visual",
    "description": "It's what it says on the tin. A complete upgrade to Minecraft's SFX with over 170 new sound effects for UIs, items, blocks and more.",
    "source": "modrinth",
    "projectId": "ZouiUX7t",
    "dependencies": [
      "fabric-api",
      "mru",
      "yacl"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "zoomify",
    "name": "Zoomify (Zoom)",
    "version": "2.16.0+26",
    "required": false,
    "category": "ui",
    "description": "A zoom mod with infinite customizability.",
    "source": "modrinth",
    "projectId": "w7ThoJFB",
    "dependencies": [
      "1vrSzlao",
      "fabric-api",
      "yacl",
      "fabric-language-kotlin"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "alternate-current",
    "name": "Alternate Current",
    "version": "1.9.0",
    "required": false,
    "category": "redstone",
    "description": "An efficient and non-locational redstone dust implementation",
    "source": "modrinth",
    "projectId": "r0v8vy1s",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "peek",
    "name": "Peek",
    "version": "1.5.1+26",
    "required": false,
    "category": "ui",
    "description": "A Fabric mod that provides additional information about items and blocks",
    "source": "modrinth",
    "projectId": "TnOXNf5e",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "pistorder",
    "name": "Pistorder",
    "version": "1.6.14-mc26",
    "required": false,
    "category": "redstone",
    "description": "A mod that shows the block movement order of a piston",
    "source": "modrinth",
    "projectId": "lpin1bEg",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "jade",
    "name": "Jade 🔍",
    "version": "26.1.3",
    "required": false,
    "category": "ui",
    "description": "Shows information about what you are looking at. (Hwyla/Waila fork for Minecraft 1.16+)",
    "source": "modrinth",
    "projectId": "nvQzSEkH",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "lithium",
    "name": "Lithium",
    "version": "0.24.5+mc26",
    "required": false,
    "category": "performance",
    "description": "No-compromises game logic optimization mod, useful for both single-player games and multi-player servers.",
    "source": "modrinth",
    "projectId": "gvQqBUqZ",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "entityculling",
    "name": "Entity Culling",
    "version": "1.10.2-mc26",
    "required": false,
    "category": "performance",
    "description": "Using async path-tracing to hide Block-/Entities that are not visible",
    "source": "modrinth",
    "projectId": "NNAgCjsB",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "malilib",
    "name": "MaLiLib",
    "version": "26.1.2-0",
    "required": false,
    "category": "building",
    "description": "A library mod for client-side mods. Contains most of the common/shared code of masa's client mods, and adds some inter-operation support between the dependent mods.",
    "source": "modrinth",
    "projectId": "GcWjdA9I",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "forge-config-api-port",
    "name": "Forge Config API Port",
    "version": "26.1.5-mc26",
    "required": false,
    "category": "library",
    "description": "NeoForge's & Forge's config systems provided to other modding ecosystems. Designed for a multiloader architecture.",
    "source": "modrinth",
    "projectId": "ohNO6lps",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "sodium-extra",
    "name": "Sodium Extra",
    "version": "0.8.7+mc26",
    "required": false,
    "category": "performance",
    "description": "A Sodium addon that adds features that shouldn't be in Sodium.",
    "source": "modrinth",
    "projectId": "PtjYWJkn",
    "dependencies": [
      "sodium"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "cubes-without-borders",
    "name": "Cubes Without Borders",
    "version": "4.0.6+26",
    "required": false,
    "category": "other",
    "description": "Allows you to play Minecraft in a borderless fullscreen window.",
    "source": "modrinth",
    "projectId": "ETlrkaYF",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "no-chat-reports",
    "name": "No Chat Reports",
    "version": "2.19.0",
    "required": false,
    "category": "network",
    "description": "Makes chat unreportable (where possible)",
    "source": "modrinth",
    "projectId": "qQyHxfxd",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "morechathistory",
    "name": "More Chat History",
    "version": "2.0.0",
    "required": false,
    "category": "ui",
    "description": "Increases the maximum length of chat history.",
    "source": "modrinth",
    "projectId": "8qkXwOnk",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "chat-heads",
    "name": "Chat Heads",
    "version": "1.2.2-fabric-26",
    "required": false,
    "category": "ui",
    "description": "See who you're chatting with!",
    "source": "modrinth",
    "projectId": "Wb5oqrBJ",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "mru",
    "name": "MRU",
    "version": "1.0.28+lts+26",
    "required": false,
    "category": "library",
    "description": "A library mod used by Cassian and IMB11's mods to function.",
    "source": "modrinth",
    "projectId": "SNVQ2c0g",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "bobby",
    "name": "Bobby",
    "version": "5.2.13+mc26",
    "required": false,
    "category": "performance",
    "description": "Allows for render distances greater than the server's view-distance",
    "source": "modrinth",
    "projectId": "M08ruV16",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "simple-voice-chat",
    "name": "Simple Voice Chat",
    "version": "2.6.18+26",
    "required": false,
    "category": "network",
    "description": "A working voice chat in Minecraft!",
    "source": "modrinth",
    "projectId": "9eGKb6K1",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "collective",
    "name": "Collective",
    "version": "26.1.2-8",
    "required": false,
    "category": "library",
    "description": "🎓 Collective is a shared library with common code for all of Serilum's mods.",
    "source": "modrinth",
    "projectId": "e0M1UDsY",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "blur-plus",
    "name": "Blur+",
    "version": "6.2.0+26",
    "required": false,
    "category": "other",
    "description": "Spices up the boring vanilla blur effect – featuring animations, colors and lots of customizability!",
    "source": "modrinth",
    "projectId": "NK39zBp2",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "dawnguireader",
    "name": "DawnGuiReader",
    "version": "1.2.0",
    "required": false,
    "category": "library",
    "description": "Reads inventory items, enchantments, hotbar selections, crosshair blocks, and GUI text aloud via system TTS for blind and low-vision players. Includes a high-contrast large-text overlay, per-feature delays, and cross-platform voice support.",
    "source": "modrinth",
    "projectId": "bJNYg6Np",
    "dependencies": [
      "cloth-config",
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "sodium",
    "name": "Sodium",
    "version": "0.8.12+mc26",
    "required": false,
    "category": "performance",
    "description": "A high-performance rendering engine replacement for Minecraft, which greatly improves frame rates and reduces micro-stutter.",
    "source": "modrinth",
    "projectId": "AANobbMI",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "chest-tracker-port",
    "name": "Chest Tracker (Unofficial port)",
    "version": "2.8.2+26",
    "required": false,
    "category": "world",
    "description": "Client side item storage - remember where you've put things. Unofficial port Chest Tracker.",
    "source": "modrinth",
    "projectId": "VC2NohMN",
    "dependencies": [
      "yacl",
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "ferrite-core",
    "name": "FerriteCore",
    "version": "9.0.0-fabric",
    "required": false,
    "category": "performance",
    "description": "Memory usage optimizations",
    "source": "modrinth",
    "projectId": "uXXizFIs",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "viafabricplus",
    "name": "ViaFabricPlus",
    "version": "4.5.4",
    "required": false,
    "category": "network",
    "description": "Minecraft Fabric mod which allows you to join EVERY Minecraft server version (Classic, Alpha, Beta, Release, April Fools, Bedrock)",
    "source": "modrinth",
    "projectId": "rIC2XJV4",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "language-reload",
    "name": "Language Reload",
    "version": "1.7.6+26",
    "required": false,
    "category": "other",
    "description": "Reduces load times and adds fallbacks for languages",
    "source": "modrinth",
    "projectId": "uLbm7CG6",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "controlify",
    "name": "Controlify (Controller support)",
    "version": "3.0.1+26",
    "required": false,
    "category": "other",
    "description": "Adds the best controller support to Minecraft Java edition!",
    "source": "modrinth",
    "projectId": "DOUdJVEm",
    "dependencies": [
      "yacl",
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "rp-Ik3Z3RFx",
    "name": "[RP] Fyoncle's 3D Trims",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "Ik3Z3RFx",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-xCJJc5Mh",
    "name": "[RP] voxytranslate1.7",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "xCJJc5Mh",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-lkoaSYls",
    "name": "[RP] rE-oCd-12110",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "lkoaSYls",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-me8t48Yi",
    "name": "[RP] §fReanimated §3Blue §7v0.10",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "me8t48Yi",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-lkoaSYls",
    "name": "[RP] rE-oCd-261",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "lkoaSYls",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-CpA767Rl",
    "name": "[RP] TransparentGUI-1.21.X-R1.4",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "CpA767Rl",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-r4GILswZ",
    "name": "[RP] Faithful 64x - Release 13",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "r4GILswZ",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-WkLr6o3M",
    "name": "[RP] Glowing 3D Armor",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "WkLr6o3M",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-X4S78Ho4",
    "name": "[RP] Drigo 3D Lantern's x Punchy",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "X4S78Ho4",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-8NfOgJ9A",
    "name": "[RP] CrosslessLamps-16x-1.19.3",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "8NfOgJ9A",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-LGnScTVE",
    "name": "[RP] Glowing 3D Totem",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "LGnScTVE",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-l2nl8HQJ",
    "name": "[RP] Refined Buckets 2.4.1",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "l2nl8HQJ",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-S6XROiqp",
    "name": "[RP] 红石必备材质!原版风格!1.21.5",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "S6XROiqp",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-IphzCmyy",
    "name": "[RP] Leo's Copper Bulb Retexture",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "IphzCmyy",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-XlqZTP4W",
    "name": "[RP] Round-Trees-8.3",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "XlqZTP4W",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-M6aa729D",
    "name": "[RP] refined torches 2.1",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "M6aa729D",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-19x3Exzi",
    "name": "[RP] Croakma-keys v1.1 [1.19-1.21.9]",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "19x3Exzi",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-wyzOam9h",
    "name": "[RP] Fresh Flowers and Plants 1.4.8",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "wyzOam9h",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-hTdhcjMu",
    "name": "[RP] [1.19.4]自定义红石线power0蓝色",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "hTdhcjMu",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-A8aBf1Xa",
    "name": "[RP] rotrBLOCKS V86 [3D Foliage] 128x 26.2-1.13",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "A8aBf1Xa",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-8olVtpyI",
    "name": "[RP] Reimagined GUI - Dark - 1.20.2-26.x",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "8olVtpyI",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-oL18adaQ",
    "name": "[RP] NewGlowingOres-§6[Border]§r",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "oL18adaQ",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-wWuKu8jZ",
    "name": "[RP] White Lamps 1.21.5 Ver 1.1.1",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "wWuKu8jZ",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-r4GILswZ",
    "name": "[RP] Faithful 64x - December 2025 Release",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "r4GILswZ",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-6SLU7tS5",
    "name": "[RP] Default-Dark-Mode-26.1-2026.4.0",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "6SLU7tS5",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-w0TnApzs",
    "name": "[RP] Faithful 32x - 1.21.11",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "w0TnApzs",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-ta5dy0aA",
    "name": "[RP] §aReimagined§0_§8[v1.62.2]§0",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "ta5dy0aA",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-qfYE1L5z",
    "name": "[RP] Subtly Glowing Ores 1.21.9",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "qfYE1L5z",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-50dA9Sha",
    "name": "[RP] FreshAnimations_v1.10.5",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "50dA9Sha",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-OBC8zhs4",
    "name": "[RP] 金合欢的Xaero地图翻译_1.16+",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "OBC8zhs4",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-UGEVQ6t9",
    "name": "[RP] Fancy Crops v1.3",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "UGEVQ6t9",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "rp-yfDziwn1",
    "name": "[RP] SodiumTranslations",
    "version": "latest",
    "required": false,
    "category": "resourcepack",
    "description": "",
    "source": "modrinth",
    "projectId": "yfDziwn1",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "sp-EpQFjzrQ",
    "name": "[SP] Solas Shader V3.6",
    "version": "latest",
    "required": false,
    "category": "shaderpack",
    "description": "",
    "source": "modrinth",
    "projectId": "EpQFjzrQ",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "sp-R6NEzAwj",
    "name": "[SP] ComplementaryUnbound_r5.8.1",
    "version": "latest",
    "required": false,
    "category": "shaderpack",
    "description": "",
    "source": "modrinth",
    "projectId": "R6NEzAwj",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "sp-HVnmMxH1",
    "name": "[SP] ComplementaryReimagined_r5.8.1",
    "version": "latest",
    "required": false,
    "category": "shaderpack",
    "description": "",
    "source": "modrinth",
    "projectId": "HVnmMxH1",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "sp-lLqFfGNs",
    "name": "[SP] photon_v1.3b",
    "version": "latest",
    "required": false,
    "category": "shaderpack",
    "description": "",
    "source": "modrinth",
    "projectId": "lLqFfGNs",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "sp-kmwfVOoi",
    "name": "[SP] rethinking-voxels_r0.1-beta9",
    "version": "latest",
    "required": false,
    "category": "shaderpack",
    "description": "",
    "source": "modrinth",
    "projectId": "kmwfVOoi",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "sp-Q1vvjJYV",
    "name": "[SP] BSL_v10.1.3",
    "version": "latest",
    "required": false,
    "category": "shaderpack",
    "description": "",
    "source": "modrinth",
    "projectId": "Q1vvjJYV",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "sp-ZvMtQlho",
    "name": "[SP] Bliss_v2.1.2_(Chocapic13_Shaders_edit)",
    "version": "latest",
    "required": false,
    "category": "shaderpack",
    "description": "",
    "source": "modrinth",
    "projectId": "ZvMtQlho",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  }
  ,
  {
    "id": "carpet",
    "name": "Carpet",
    "version": "latest",
    "required": false,
    "category": "redstone",
    "description": "Take full control over your vanilla game; the foundation for technical Minecraft",
    "source": "modrinth",
    "projectId": "TISvIxsL",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "mouse-tweaks",
    "name": "Mouse Tweaks",
    "version": "latest",
    "required": false,
    "category": "ui",
    "description": "Mouse button inventory management - drag, shift-click, and more",
    "source": "modrinth",
    "projectId": "aC3cZGhw",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "betterf3",
    "name": "BetterF3",
    "version": "latest",
    "required": false,
    "category": "ui",
    "description": "Customizable, human-readable debug HUD (F3 screen)",
    "source": "modrinth",
    "projectId": "8fKl2pVQ",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "debugify",
    "name": "Debugify",
    "version": "latest",
    "required": false,
    "category": "other",
    "description": "Fixes 70+ vanilla Minecraft bugs from the bug tracker",
    "source": "modrinth",
    "projectId": "4OgeTL7e",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "shulkerboxtooltip",
    "name": "Shulker Box Tooltip",
    "version": "latest",
    "required": false,
    "category": "ui",
    "description": "View contents of shulker boxes from your inventory tooltip",
    "source": "modrinth",
    "projectId": "5kq90LkX",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "auth-me",
    "name": "Auth Me",
    "version": "latest",
    "required": false,
    "category": "other",
    "description": "Re-validate Microsoft auth session without restarting the game",
    "source": "modrinth",
    "projectId": "yMgs3MKB",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "badoptimizations",
    "name": "BadOptimizations",
    "version": "latest",
    "required": false,
    "category": "performance",
    "description": "Optimizes non-rendering systems: GUI, sound, and misc hot code paths",
    "source": "modrinth",
    "projectId": "JiVaRFfj",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "particle-core",
    "name": "Particle Core",
    "version": "latest",
    "required": false,
    "category": "performance",
    "description": "Particle culling, rendering optimization, per-type spawn reduction",
    "source": "modrinth",
    "projectId": "CWzzSoM2",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "c2me",
    "name": "C2ME (Concurrent Chunk Management Engine)",
    "version": "latest",
    "required": false,
    "category": "performance",
    "description": "Multi-threaded chunk generation and loading for major world-gen speedups",
    "source": "modrinth",
    "projectId": "VSNURg3q",
    "dependencies": [],
    "env": {
      "client": "optional",
      "server": "required"
    }
  },
  {
    "id": "scalablelux",
    "name": "ScalableLux",
    "version": "latest",
    "required": false,
    "category": "performance",
    "description": "High-performance lighting engine replacement (successor to Starlight)",
    "source": "modrinth",
    "projectId": "TLGxoVnq",
    "dependencies": [],
    "env": {
      "client": "optional",
      "server": "required"
    }
  },
  {
    "id": "copper-hopper",
    "name": "Copper Hopper",
    "version": "latest",
    "required": false,
    "category": "redstone",
    "description": "Hopper that acts as a simple item filter",
    "source": "modrinth",
    "projectId": "lYpHN5hB",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "tc-wireless-redstone",
    "name": "TC Wireless Redstone",
    "version": "latest",
    "required": false,
    "category": "redstone",
    "description": "Transmit redstone signals wirelessly between transmitter and receiver",
    "source": "modrinth",
    "projectId": "uMmeOjBd",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "antishadowpatch",
    "name": "AntiShadowPatch",
    "version": "latest",
    "required": false,
    "category": "redstone",
    "description": "Brings back technical bugs/mechanics Mojang patched (duplication etc.)",
    "source": "modrinth",
    "projectId": "Gz2EBJmV",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "omnihopper",
    "name": "Omni-Hopper",
    "version": "latest",
    "required": false,
    "category": "redstone",
    "description": "Break free from normal hopper constraints; true item transport freedom",
    "source": "modrinth",
    "projectId": "yWp3YZnJ",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "force-close-world-loading-screen",
    "name": "Force Close World Loading Screen",
    "version": "latest",
    "required": false,
    "category": "performance",
    "description": "Instantly closes loading terrain screen, speeds up resource pack loading",
    "source": "modrinth",
    "projectId": "bl5MIp9o",
    "dependencies": [
      "modmenu"
    ],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "polytone",
    "name": "Polytone",
    "version": "latest",
    "required": false,
    "category": "visual",
    "description": "Customize map colors, block colors, colormaps, sounds, biome colors, colored lights",
    "source": "modrinth",
    "projectId": "V4OVfl2P",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "optional"
    }
  }
  ,
  {
    "id": "carpet-tis-addition",
    "name": "Carpet TIS Addition",
    "version": "latest",
    "required": false,
    "category": "redstone",
    "description": "Major Carpet extension: anti-cheat, technical features, game rules",
    "source": "modrinth",
    "projectId": "jE0S5YcZ",
    "dependencies": [
      "carpet"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "carpet-extra",
    "name": "Carpet Extra",
    "version": "latest",
    "required": false,
    "category": "redstone",
    "description": "Additional dispenser behaviors, renewable resources via Carpet",
    "source": "modrinth",
    "projectId": "G5Q1MkZy",
    "dependencies": [
      "carpet"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "carpet-org-addition",
    "name": "Carpet Org Addition",
    "version": "latest",
    "required": false,
    "category": "redstone",
    "description": "Expansion mod for Carpet with extra rules and features",
    "source": "modrinth",
    "projectId": "kzsyf4pE",
    "dependencies": [
      "carpet"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "syncmatica",
    "name": "Syncmatica",
    "version": "latest",
    "required": false,
    "category": "building",
    "description": "Share Litematica schematics and placements with other players",
    "source": "modrinth",
    "projectId": "bfneeBkY",
    "dependencies": [
      "carpet",
      "malilib",
      "litematica"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "inventory-profiles-next",
    "name": "Inventory Profiles Next",
    "version": "latest",
    "required": false,
    "category": "ui",
    "description": "Full inventory control: sort, move matching, locked slots, gear sets",
    "source": "modrinth",
    "projectId": "O7RBQmYr",
    "dependencies": [
      "libipn",
      "fabric-language-kotlin",
      "modmenu"
    ],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "chat-animation",
    "name": "Chat Animation",
    "version": "latest",
    "required": false,
    "category": "ui",
    "description": "Smooth slide-in animation for chat messages",
    "source": "modrinth",
    "projectId": "wqFxtBKA",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "durability-tooltip",
    "name": "Durability Tooltip",
    "version": "latest",
    "required": false,
    "category": "ui",
    "description": "Shows item durability in tooltip",
    "source": "modrinth",
    "projectId": "8WGn4jMh",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "easy-shulker-boxes",
    "name": "Easy Shulker Boxes",
    "version": "latest",
    "required": false,
    "category": "ui",
    "description": "Browse/insert/extract shulker contents directly from inventory",
    "source": "modrinth",
    "projectId": "tq5RiXlG",
    "dependencies": [
      "puzzles-lib",
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "moremousetweaks",
    "name": "More Mouse Tweaks",
    "version": "latest",
    "required": false,
    "category": "ui",
    "description": "Complements Mouse Tweaks with scroll-wheel features",
    "source": "modrinth",
    "projectId": "DhTnHdGK",
    "dependencies": [
      "mouse-tweaks",
      "cloth-config"
    ],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "technical-utilities",
    "name": "Technical Utilities",
    "version": "latest",
    "required": false,
    "category": "redstone",
    "description": "Client-side tweaks for Litematica, WorldEdit, and other small utilities",
    "source": "modrinth",
    "projectId": "t6IhNIri",
    "dependencies": [
      "fabric-api",
      "malilib",
      "litematica"
    ],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "worldedit",
    "name": "WorldEdit",
    "version": "latest",
    "required": false,
    "category": "building",
    "description": "In-game map editor; essential for redstone building",
    "source": "modrinth",
    "projectId": "1u6Jk5MM",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "libipn",
    "name": "libIPN",
    "version": "latest",
    "required": false,
    "category": "library",
    "description": "Library dependency for Inventory Profiles Next",
    "source": "modrinth",
    "projectId": "nlVpxKqs",
    "dependencies": [],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "puzzles-lib",
    "name": "Puzzles Lib",
    "version": "latest",
    "required": false,
    "category": "library",
    "description": "Shared library for Puzzles by CeoFrodo mods",
    "source": "modrinth",
    "projectId": "QAGBm7bp",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  }
  ,
  {
    "id": "qualia-carpet-addition",
    "name": "Qualia Carpet Addition (QCA)",
    "version": "latest",
    "required": false,
    "category": "redstone",
    "description": "Redstone/survival-oriented Carpet addition: hopper limits, beacon range, flower bonemealing, items through chains",
    "source": "modrinth",
    "projectId": "qH8fR5jN",
    "dependencies": [
      "carpet"
    ],
    "env": {
      "client": "required",
      "server": "required"
    }
  },
  {
    "id": "shulker-box-labels",
    "name": "Shulker Box Labels",
    "version": "latest",
    "required": false,
    "category": "ui",
    "description": "Add item labels to shulker boxes via anvil with 3D/flat display modes",
    "source": "modrinth",
    "projectId": "m8r2bKxP",
    "dependencies": [
      "fabric-api"
    ],
    "env": {
      "client": "required",
      "server": "optional"
    }
  },
  {
    "id": "c2me-opencl",
    "name": "C2ME OpenCL Acceleration Module",
    "version": "latest",
    "required": false,
    "category": "performance",
    "description": "Experimental GPU-accelerated world generation via OpenCL for C2ME",
    "source": "modrinth",
    "projectId": "pQ3kV7wT",
    "dependencies": [
      "c2me"
    ],
    "env": {
      "client": "optional",
      "server": "required"
    }
  }
];

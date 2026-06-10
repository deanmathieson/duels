/**
 * scrape-art.mjs — Worker E art scraper
 *
 * Downloads Hearthstone card art from HearthstoneJSON for all card/hero/treasure IDs
 * defined in data/CONTENT.md. Saves PNGs into public/assets/{cards,heroes,treasures}/.
 * Writes a manifest JSON at public/assets/art-manifest.json.
 *
 * Usage: node scripts/scrape-art.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Generated list of EVERY content id -> display name (all classes). Produced by
// tests/zz-emit-art-list.spec.ts. Falls back to NAME_MAP-only if absent.
let ART_LIST = { names: {}, heroIds: [], treasureIds: [] };
try {
  ART_LIST = JSON.parse(readFileSync(resolve(__dirname, 'art-list.json'), 'utf8'));
} catch {
  /* no generated list — only the curated NAME_MAP below will be scraped */
}
const HERO_ID_SET = new Set([...(ART_LIST.heroIds || []), 'forest_warden_omu']);

// ---------------------------------------------------------------------------
// Explicit mapping: OUR id -> real Hearthstone card name (case-insensitive lookup)
// Covers all ids from CONTENT.md: cards, tokens, hero, hero powers, treasures, enemies.
// ---------------------------------------------------------------------------

/** @type {Record<string, string>} ourId -> hearthstone card name */
const NAME_MAP = {
  // --- tokens ---
  treant: 'Treant',
  treant_taunt: 'Treant',
  sapling: 'Sapling',
  panther: 'Panther',
  the_coin: 'The Coin',

  // --- druid cards ---
  innervate: 'Innervate',
  moonfire: 'Moonfire',
  claw: 'Claw',
  living_roots: 'Living Roots',
  mark_of_the_wild: 'Mark of the Wild',
  wild_growth: 'Wild Growth',
  wrath: 'Wrath',
  power_of_the_wild: 'Power of the Wild',
  savage_roar: 'Savage Roar',
  mulch: 'Mulch',
  keeper_of_the_grove: 'Keeper of the Grove',
  swipe: 'Swipe',
  nourish: 'Nourish',
  force_of_nature: 'Force of Nature',
  druid_of_the_claw: 'Druid of the Claw',
  starfire: 'Starfire',
  ancient_of_lore: 'Ancient of Lore',
  ancient_of_war: 'Ancient of War',
  ironbark_protector: 'Ironbark Protector',
  cenarius: 'Cenarius',

  // --- neutral cards ---
  wisp: 'Wisp',
  elven_archer: 'Elven Archer',
  river_crocolisk: 'River Crocolisk',
  bloodfen_raptor: 'Bloodfen Raptor',
  ironfur_grizzly: 'Ironfur Grizzly',
  sen_jin_shieldmasta: "Sen'jin Shieldmasta",
  chillwind_yeti: 'Chillwind Yeti',
  oasis_snapjaw: 'Oasis Snapjaw',
  gnomish_inventor: 'Gnomish Inventor',
  sunwalker: 'Sunwalker',
  fire_elemental: 'Fire Elemental',
  boulderfist_ogre: 'Boulderfist Ogre',
  war_golem: 'War Golem',
  stormwind_champion: 'Stormwind Champion',

  // --- enemy class cards ---
  fireball: 'Fireball',
  frostbolt: 'Frostbolt',
  arcane_intellect: 'Arcane Intellect',
  kill_command: 'Kill Command',
  arcane_shot: 'Arcane Shot',
  animal_companion: 'Animal Companion',
  shield_block: 'Shield Block',
  consecration: 'Consecration',
  soulfire: 'Soulfire',
  flame_imp: 'Flame Imp',
  truesilver: 'Truesilver Champion',
  assassinate: 'Assassinate',

  // --- hero portrait ---
  forest_warden_omu: 'Forest Warden Omu',

  // --- hero powers (player) ---
  hp_natures_gifts: "Nature's Gifts",
  hp_invigorating_bloom: 'Invigorating Bloom',
  hp_harvest_time: 'Harvest Time!',

  // --- hero powers (enemy) ---
  hp_fireblast: 'Fireblast',
  hp_steady_shot: 'Steady Shot',
  hp_reinforce: 'Reinforce',
  hp_life_tap: 'Life Tap',
  hp_armor_up: 'Armor Up!',
  hp_lesser_heal: 'Lesser Heal',

  // --- passive treasures ---
  tr_robe_of_the_magi: 'Robe of the Magi',
  tr_bitter_cold: 'Bitter Cold',
  tr_inspiring_presence: 'Inspiring Presence',
  tr_hold_the_line: 'Hold the Line',
  tr_natural_force: 'Natural Force',
  tr_rocket_backpacks: 'Rocket Backpacks',
  tr_arcane_brilliance: 'Arcane Brilliance',
  tr_potion_of_sparking: 'Potion of Sparking',
  tr_divine_illumination: 'Divine Illumination',
  tr_crystal_gem: 'Crystal Gem',
  tr_iron_hide: 'Iron Hide',
  tr_vampiric_fangs: 'Vampiric Fangs',
  tr_menagerie: 'Menagerie Warden',
  tr_barkskin: 'Barkskin',
  tr_double_treant: 'Double Time',
  tr_growing_season: 'Growing Season',

  // --- active treasures ---
  tr_supercharge: 'Supercharge',
  tr_bag_of_coins: 'Bag of Coins',
  tr_archmage_staff: 'Archmage Staff',
  tr_pure_cold: 'Pure Cold',
  tr_blood_moon: 'Blood Moon',
  tr_mark_of_might: 'Mark of Might',
  tr_meteor_strike: 'Meteor Strike',
  tr_healing_touch: 'Healing Touch',
  tr_summon_grizzly: 'Faithful Companions',
  tr_devastation: 'Devastation',
  tr_research: 'Research',
  tr_fortify: 'Fortify',

  // --- signature treasures ---
  sig_wardens_insight: "Warden's Insight",
  sig_herding_horn: 'Herding Horn',
  sig_marvelous_mycelium: 'Marvelous Mycelium',
  sig_awakened_ancient: 'Awakened Ancient',
  sig_zukara: 'Zukara the Wild',
  sig_moonbeast: 'Moonbeast',

  // ---------------------------------------------------------------------------
  // ALIASES for invented/Duels-specific ids with no same-name HS card.
  // Each maps to a thematically/visually similar real card purely for ART.
  // ---------------------------------------------------------------------------

  // treasures
  tr_growing_season: 'Overgrowth',
  tr_mark_of_might: 'Mark of the Lotus',
  tr_meteor_strike: 'Meteor',
  tr_research: 'Arcane Intellect',
  tr_devastation: 'Flamestrike',
  treasure_grizzly: 'Ironfur Grizzly',

  // class cards / tokens
  hunter_master_of_the_wild_hunt: 'Savannah Highmane',
  mage_ice_block_scroll: 'Ice Block',
  mage_nexus_champion: 'Nexus-Champion Saraad',
  paladin_faerie_dragon: 'Faerie Dragon',
  priest_spirit_token: 'Spirit Lash',
  priest_lightwell: 'Lightwell',
  priest_storecroom_helper: 'Northshire Cleric',
  priest_fanatical_acolyte: 'Acolyte of Agony',
  priest_devout_chaplain: 'Temple Enforcer',
  rogue_lackey: 'Kobold Lackey',
  rogue_whetted_dagger: 'Deadly Poison',
  rogue_shadow_agent: 'SI:7 Agent',
  rogue_kingsbane_blade: 'Kingsbane',
  rogue_sharp_dagger: 'Wicked Knife',
  rogue_cutlass: 'Dread Corsair',
  shaman_token_stoneskin_totem: 'Stoneclaw Totem',
  shaman_token_healing_stream_totem: 'Healing Totem',
  shaman_token_lightning_elemental: 'Unbound Elemental',
  shaman_thunderbluff_valiant: 'Thunder Bluff Valiant',
  warlock_void_caller: 'Voidcaller',

  // signature treasures (invented)
  sig_warrior_bladestorm_axe: 'Arcanite Reaper',
  sig_hunter_kill_command_barrage: 'Kill Command',
  sig_hunter_beast_bond: 'Tundra Rhino',
  sig_mage_grand_magus_staff: 'Aluneth',
  sig_mage_arcane_overdrive: 'Arcane Blast',
  sig_paladin_rallying_banner: 'Stand Against Darkness',
  sig_paladin_hand_of_anyfin: 'Anyfin Can Happen',
  sig_priest_lightbringer_blade: "Light's Justice",
  sig_priest_benediction: 'Holy Nova',
  sig_rogue_thieves_canvas: 'Tess Greymane',
  sig_rogue_thieves_canvas_card: 'Tess Greymane',
  sig_rogue_kingpin: 'Heistbaron Togwaggle',
  sig_rogue_kingpin_card: 'Heistbaron Togwaggle',
  sig_rogue_pillage: 'Pilfer',
  sig_rogue_pillage_card: 'Pilfer',
  sig_shaman_storm_caller: 'Lightning Storm',
  sig_shaman_tide_pool: 'Tidal Surge',
  sig_shaman_ancestral_spirits: 'Ancestral Spirit',
  sig_shaman_spirit_of_the_elements: 'Spirit of the Frog',
  sig_warlock_dark_covenant: 'Dark Pact',
  sig_warlock_demonic_tide: 'Demonwrath',
  sig_warrior_rattlegore_chain: 'Rattlegore',
  sig_warrior_death_wish: 'Mortal Strike',
  sig_warrior_colossus: 'Colossus of the Moon',

  // enemy hero portraits (real HS heroes / thematic stand-ins)
  enemy_aggro_hunter: 'Rexxar',
  enemy_tempo_mage: 'Khadgar',
  enemy_midrange_paladin: 'Uther Lightbringer',
  enemy_zoo_warlock: "Gul'dan",
  enemy_control_warrior: 'Garrosh Hellscream',
  boss_arcane_amalgam: 'Astromancer Solarian',

  // hero powers (invented)
  hp_mage_arcane_surge: 'Arcane Missiles',
  hp_mage_open_the_portal: 'Open the Waygate',
  hp_mage_frigid_blast: 'Ice Lance',
  hp_priest_mending: 'Flash Heal',
  hp_priest_holy_words: 'Holy Smite',
  hp_rogue_shadow_step: 'Shadowstep',
  hp_shaman_storm_strike: 'Stormstrike',
  hp_shaman_ancestral_mending: 'Ancestral Healing',
  hp_warlock_imp_summoner: 'Imp Gang Boss',
  hp_warrior_execute_strike: 'Execute',
};

// ---------------------------------------------------------------------------
// Category mapping: where does each id's image go?
// ---------------------------------------------------------------------------

/** ids that are hero portraits → public/assets/heroes/ */
const HERO_IDS = new Set(['forest_warden_omu']);

/** ids that are treasures → public/assets/treasures/ */
const TREASURE_IDS = new Set(Object.keys(NAME_MAP).filter(
  (id) => id.startsWith('tr_') || id.startsWith('sig_')
));

/** ids that are hero powers → treated as cards (public/assets/cards/) */
// Everything else (including hp_* for hero powers) → public/assets/cards/

/**
 * Returns the output directory and URL size for a given our-id.
 * @param {string} ourId
 * @returns {{ outDir: string; urlSize: string; assetPath: string }}
 */
function getAssetInfo(ourId) {
  // Full-resolution artwork (512x) everywhere — cards can render large in the
  // hover preview, and the artwork-only crop fills our frames cleanly.
  if (ourId.startsWith('enemy_') || ourId.startsWith('boss_')) {
    return {
      outDir: resolve(ROOT, 'public/assets/heroes'),
      urlSize: '512x',
      assetPath: `/assets/heroes/${ourId}.jpg`,
    };
  }
  if (HERO_ID_SET.has(ourId)) {
    return {
      outDir: resolve(ROOT, 'public/assets/heroes'),
      urlSize: '512x',
      assetPath: `/assets/heroes/${ourId}.jpg`,
    };
  }
  if (ourId.startsWith('tr_') || ourId.startsWith('sig_')) {
    return {
      outDir: resolve(ROOT, 'public/assets/treasures'),
      urlSize: '512x',
      assetPath: `/assets/treasures/${ourId}.jpg`,
    };
  }
  return {
    outDir: resolve(ROOT, 'public/assets/cards'),
    urlSize: '512x',
    assetPath: `/assets/cards/${ourId}.jpg`,
  };
}

// ---------------------------------------------------------------------------
// Fetch HearthstoneJSON card database and build name → cardId map
// ---------------------------------------------------------------------------

/**
 * Downloads the full HearthstoneJSON card DB and returns a map of
 * lowercase(name) → dbfId string, preferring COLLECTIBLE cards.
 * @returns {Promise<Map<string, string>>}
 */
async function buildNameToIdMap() {
  const url = 'https://api.hearthstonejson.com/v1/latest/enUS/cards.json';
  console.log(`Fetching card DB from ${url} …`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch card DB: ${res.status} ${res.statusText}`);
  /** @type {Array<{id: string; dbfId: number; name: string; collectible?: boolean}>} */
  const cards = await res.json();
  console.log(`  Loaded ${cards.length} cards from HearthstoneJSON`);

  /** @type {Map<string, {cardId: string; collectible: boolean}>} */
  const byName = new Map();

  for (const card of cards) {
    if (!card.name || !card.id) continue;
    const key = card.name.toLowerCase().trim();
    const existing = byName.get(key);
    const isCollectible = !!card.collectible;
    // Prefer collectible; among equal prefer earlier (stable)
    if (!existing || (!existing.collectible && isCollectible)) {
      byName.set(key, { cardId: card.id, collectible: isCollectible });
    }
  }

  /** @type {Map<string, string>} lowercase name -> cardId */
  const result = new Map();
  for (const [name, { cardId }] of byName) {
    result.set(name, cardId);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Download a single image
// ---------------------------------------------------------------------------

/**
 * Downloads one ARTWORK image from the HearthstoneJSON CDN. We deliberately use
 * the artwork-only endpoint (/v1/{size}/{id}.jpg) rather than the full card
 * `render` endpoint — the render bakes in the frame/name/text/gems, which looked
 * like a tiny card-within-a-card inside our own frame. The artwork is full-bleed
 * illustration that fills our art window properly.
 * @param {string} cardId  - the real HS card id (e.g. 'EX1_154')
 * @param {string} outPath - absolute path to write the JPG
 * @param {string} urlSize - '512x' or '256x'
 * @returns {Promise<boolean>} true if successfully downloaded
 */
async function downloadImage(cardId, outPath, urlSize) {
  const url = `https://art.hearthstonejson.com/v1/${urlSize}/${cardId}.jpg`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return false;
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buf = await res.arrayBuffer();
  writeFileSync(outPath, Buffer.from(buf));
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Ensure output dirs exist
  for (const sub of ['cards', 'heroes', 'treasures']) {
    mkdirSync(resolve(ROOT, `public/assets/${sub}`), { recursive: true });
  }

  // Build name->cardId lookup from HearthstoneJSON
  let nameToId;
  try {
    nameToId = await buildNameToIdMap();
  } catch (err) {
    console.error('FATAL: could not load HearthstoneJSON card DB:', err.message);
    process.exit(1);
  }

  // Work over EVERY id: the generated art-list (all classes) + the curated map.
  const names = ART_LIST.names || {};
  const allOurIds = Array.from(new Set([...Object.keys(NAME_MAP), ...Object.keys(names)]));
  console.log(`\nProcessing ${allOurIds.length} ids …\n`);

  /** @type {Record<string, string>} ourId -> assetPath */
  const manifest = {};
  /** @type {string[]} */
  const missing = [];

  // Concurrency: process in batches of 4 to be polite
  const CONCURRENCY = 4;

  for (let i = 0; i < allOurIds.length; i += CONCURRENCY) {
    const batch = allOurIds.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (ourId) => {
        const hsName = NAME_MAP[ourId] || names[ourId];
        if (!hsName) {
          missing.push(ourId);
          return;
        }
        const hsCardId = nameToId.get(hsName.toLowerCase().trim());

        if (!hsCardId) {
          console.warn(`  [MISS-NOMAP] ${ourId} -> "${hsName}" not found in HS card DB`);
          missing.push(ourId);
          return;
        }

        const { outDir, urlSize, assetPath } = getAssetInfo(ourId);
        const outPath = resolve(outDir, `${ourId}.jpg`);

        // Skip if already downloaded
        if (existsSync(outPath)) {
          console.log(`  [SKIP] ${ourId} (already exists)`);
          manifest[ourId] = assetPath;
          return;
        }

        try {
          // Try preferred size first; fall back to 256x for heroes if 512x not found
          let ok = await downloadImage(hsCardId, outPath, urlSize);
          if (!ok && urlSize === '512x') {
            console.warn(`  [FALLBACK] ${ourId}: 512x not found, trying 256x`);
            ok = await downloadImage(hsCardId, outPath, '256x');
          }
          if (ok) {
            console.log(`  [OK] ${ourId} -> ${hsCardId} (${urlSize})`);
            manifest[ourId] = assetPath;
          } else {
            console.warn(`  [MISS-404] ${ourId} -> ${hsCardId} (${urlSize})`);
            missing.push(ourId);
          }
        } catch (err) {
          console.error(`  [ERR] ${ourId}: ${err.message}`);
          missing.push(ourId);
        }
      })
    );
  }

  // Write manifest
  const manifestPath = resolve(ROOT, 'public/assets/art-manifest.json');
  const manifestData = { manifest, missing };
  writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));

  const downloaded = Object.keys(manifest).length;
  const missCount = missing.length;
  console.log('\n========================================');
  console.log(`Art scraping complete.`);
  console.log(`  Downloaded : ${downloaded}`);
  console.log(`  Missing    : ${missCount}`);
  if (missing.length > 0) {
    console.log(`  Missing ids: ${missing.join(', ')}`);
  }
  console.log(`  Manifest   : ${manifestPath}`);
  console.log('========================================\n');
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

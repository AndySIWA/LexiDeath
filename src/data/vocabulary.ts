import { WordEntry } from '../types';

/** Curated French-to-English vocabulary used by the arena and the Grimoire. */
export const VOCABULARY_BANK: WordEntry[] = [
  // PRD Screenshot exact matches & daily essentials
  { id: 'sante', french: 'santé', english: 'health', category: 'daily', difficulty: 2, phonetic: '/hɛlθ/', hint: 'Bien-être physique' },
  { id: 'liberte', french: 'liberté', english: 'liberty', acceptedVariants: ['freedom', 'liberty'], category: 'daily', difficulty: 2, phonetic: '/ˈlɪbərti/', hint: 'État de ce qui est libre' },
  { id: 'nourriture', french: 'nourriture', english: 'food', acceptedVariants: ['food', 'meal'], category: 'daily', difficulty: 1, phonetic: '/fuːd/', hint: 'Ce que l\'on mange' },
  { id: 'argent', french: 'argent', english: 'money', acceptedVariants: ['money', 'cash'], category: 'daily', difficulty: 2, phonetic: '/ˈmʌni/', hint: 'Monnaie, richesse' },
  { id: 'nature', french: 'nature', english: 'nature', category: 'daily', difficulty: 2, phonetic: '/ˈneɪtʃər/', hint: 'Faune, flore et environnement' },
  { id: 'reve', french: 'rêve', english: 'dream', category: 'daily', difficulty: 2, phonetic: '/driːm/', hint: 'Songe nocturne ou idéal' },
  { id: 'apprendre', french: 'apprendre', english: 'learn', category: 'daily', difficulty: 2, phonetic: '/lɜːrn/', hint: 'Acquérir du savoir' },
  { id: 'sport', french: 'sport', english: 'sport', acceptedVariants: ['sport', 'sports'], category: 'daily', difficulty: 2, phonetic: '/spɔːrt/', hint: 'Activité physique' },
  { id: 'amour', french: 'amour', english: 'love', category: 'daily', difficulty: 1, phonetic: '/lʌv/', hint: 'Sentiment passionné' },
  { id: 'temps', french: 'temps', english: 'time', acceptedVariants: ['time', 'weather'], category: 'daily', difficulty: 1, phonetic: '/taɪm/', hint: 'Heure, durée, météo' },
  { id: 'voyage', french: 'voyage', english: 'travel', acceptedVariants: ['travel', 'trip', 'journey'], category: 'travel', difficulty: 2, phonetic: '/ˈtrævl/', hint: 'Déplacement lointain' },
  { id: 'voiture', french: 'voiture', english: 'car', acceptedVariants: ['car', 'automobile'], category: 'daily', difficulty: 1, phonetic: '/kɑːr/', hint: 'Véhicule à moteur' },
  { id: 'ecole', french: 'école', english: 'school', category: 'daily', difficulty: 2, phonetic: '/skuːl/', hint: 'Lieu d\'apprentissage' },
  { id: 'amitie', french: 'amitié', english: 'friendship', acceptedVariants: ['friendship'], category: 'daily', difficulty: 2, phonetic: '/ˈfrɛndʃɪp/', hint: 'Lien fraternel' },
  { id: 'maison', french: 'maison', english: 'house', acceptedVariants: ['house', 'home'], category: 'daily', difficulty: 2, phonetic: '/haʊs/', hint: 'Demeure' },
  { id: 'travail', french: 'travail', english: 'work', acceptedVariants: ['work', 'job'], category: 'work', difficulty: 1, phonetic: '/wɜːrk/', hint: 'Emploi, tâche' },

  // Standard short words (3-5 letters for Standard Zombies)
  { id: 'chat', french: 'chat', english: 'cat', category: 'daily', difficulty: 1, phonetic: '/kæt/' },
  { id: 'chien', french: 'chien', english: 'dog', category: 'daily', difficulty: 1, phonetic: '/dɒɡ/' },
  { id: 'feu', french: 'feu', english: 'fire', category: 'dark_fantasy', difficulty: 1, phonetic: '/ˈfaɪər/' },
  { id: 'roi', french: 'roi', english: 'king', category: 'dark_fantasy', difficulty: 1, phonetic: '/kɪŋ/' },
  { id: 'loup', french: 'loup', english: 'wolf', category: 'dark_fantasy', difficulty: 1, phonetic: '/wʊlf/' },
  { id: 'nuit', french: 'nuit', english: 'night', category: 'dark_fantasy', difficulty: 1, phonetic: '/naɪt/' },
  { id: 'peur', french: 'peur', english: 'fear', category: 'dark_fantasy', difficulty: 1, phonetic: '/fɪər/' },
  { id: 'lune', french: 'lune', english: 'moon', category: 'dark_fantasy', difficulty: 1, phonetic: '/muːn/' },
  { id: 'vent', french: 'vent', english: 'wind', category: 'daily', difficulty: 1, phonetic: '/wɪnd/' },
  { id: 'bois', french: 'bois', english: 'wood', category: 'daily', difficulty: 1, phonetic: '/wʊd/' },
  { id: 'eau', french: 'eau', english: 'water', category: 'daily', difficulty: 1, phonetic: '/ˈwɔːtər/' },
  { id: 'fer', french: 'fer', english: 'iron', category: 'dark_fantasy', difficulty: 1, phonetic: '/ˈaɪən/' },
  { id: 'sang', french: 'sang', english: 'blood', category: 'dark_fantasy', difficulty: 1, phonetic: '/blʌd/' },
  { id: 'soleil', french: 'soleil', english: 'sun', category: 'daily', difficulty: 1, phonetic: '/sʌn/' },
  { id: 'livre', french: 'livre', english: 'book', category: 'daily', difficulty: 1, phonetic: '/bʊk/' },
  { id: 'ville', french: 'ville', english: 'city', acceptedVariants: ['city', 'town'], category: 'daily', difficulty: 1, phonetic: '/ˈsɪti/' },
  { id: 'porte', french: 'porte', english: 'door', acceptedVariants: ['door', 'gate'], category: 'daily', difficulty: 1, phonetic: '/dɔːr/' },
  { id: 'ame', french: 'âme', english: 'soul', category: 'dark_fantasy', difficulty: 1, phonetic: '/soʊl/' },
  { id: 'mort', french: 'mort', english: 'death', acceptedVariants: ['death', 'dead'], category: 'dark_fantasy', difficulty: 1, phonetic: '/dɛθ/' },
  { id: 'sombre', french: 'sombre', english: 'dark', acceptedVariants: ['dark', 'dim'], category: 'dark_fantasy', difficulty: 1, phonetic: '/dɑːrk/' },
  { id: 'bleu', french: 'bleu', english: 'blue', category: 'daily', difficulty: 1, phonetic: '/bluː/' },
  { id: 'rouge', french: 'rouge', english: 'red', category: 'daily', difficulty: 1, phonetic: '/rɛd/' },
  { id: 'noir', french: 'noir', english: 'black', category: 'daily', difficulty: 1, phonetic: '/blæk/' },
  { id: 'blanc', french: 'blanc', english: 'white', category: 'daily', difficulty: 1, phonetic: '/waɪt/' },
  { id: 'chemin', french: 'chemin', english: 'path', acceptedVariants: ['path', 'way'], category: 'daily', difficulty: 1, phonetic: '/pæθ/' },

  // Fast monsters (Medium / high frequency vocabulary)
  { id: 'espoir', french: 'espoir', english: 'hope', category: 'daily', difficulty: 2, phonetic: '/hoʊp/' },
  { id: 'silence', french: 'silence', english: 'silence', category: 'dark_fantasy', difficulty: 2, phonetic: '/ˈsaɪləns/' },
  { id: 'courage', french: 'courage', english: 'courage', acceptedVariants: ['courage', 'bravery'], category: 'daily', difficulty: 2, phonetic: '/ˈkɜːrɪdʒ/' },
  { id: 'danger', french: 'danger', english: 'danger', category: 'dark_fantasy', difficulty: 2, phonetic: '/ˈdeɪndʒər/' },
  { id: 'ombre', french: 'ombre', english: 'shadow', acceptedVariants: ['shadow', 'shade'], category: 'dark_fantasy', difficulty: 2, phonetic: '/ˈʃædoʊ/' },
  { id: 'memoire', french: 'mémoire', english: 'memory', category: 'daily', difficulty: 2, phonetic: '/ˈmɛməri/' },
  { id: 'pouvoir', french: 'pouvoir', english: 'power', category: 'dark_fantasy', difficulty: 2, phonetic: '/ˈpaʊər/' },
  { id: 'secret', french: 'secret', english: 'secret', category: 'dark_fantasy', difficulty: 2, phonetic: '/ˈsiːkrət/' },
  { id: 'musique', french: 'musique', english: 'music', category: 'daily', difficulty: 2, phonetic: '/ˈmjuːzɪk/' },
  { id: 'victoire', french: 'victoire', english: 'victory', category: 'daily', difficulty: 2, phonetic: '/ˈvɪktəri/' },
  { id: 'eclair', french: 'éclair', english: 'lightning', acceptedVariants: ['lightning', 'flash'], category: 'dark_fantasy', difficulty: 2, phonetic: '/ˈlaɪtnɪŋ/' },
  { id: 'magie', french: 'magie', english: 'magic', category: 'dark_fantasy', difficulty: 2, phonetic: '/ˈmædʒɪk/' },
  { id: 'chateau', french: 'château', english: 'castle', category: 'dark_fantasy', difficulty: 2, phonetic: '/ˈkɑːsl/' },
  { id: 'guerre', french: 'guerre', english: 'war', category: 'dark_fantasy', difficulty: 2, phonetic: '/wɔːr/' },
  { id: 'connaissance', french: 'connaissance', english: 'knowledge', category: 'daily', difficulty: 2, phonetic: '/ˈnɒlɪdʒ/' },
  { id: 'univers', french: 'univers', english: 'universe', category: 'daily', difficulty: 2, phonetic: '/ˈjuːnɪvɜːrs/' },
  { id: 'bureau', french: 'bureau', english: 'office', acceptedVariants: ['office', 'desk'], category: 'work', difficulty: 2, phonetic: '/ˈɒfɪs/' },
  { id: 'reunion', french: 'réunion', english: 'meeting', category: 'work', difficulty: 2, phonetic: '/ˈmiːtɪŋ/' },
  { id: 'contrat', french: 'contrat', english: 'contract', category: 'work', difficulty: 2, phonetic: '/ˈkɒntrækt/' },
  { id: 'projet', french: 'projet', english: 'project', category: 'work', difficulty: 2, phonetic: '/ˈprɒdʒɛkt/' },
  { id: 'hopital', french: 'hôpital', english: 'hospital', category: 'medical', difficulty: 2, phonetic: '/ˈhɒspɪtl/' },
  { id: 'medecin', french: 'médecin', english: 'doctor', category: 'medical', difficulty: 2, phonetic: '/ˈdɒktər/' },
  { id: 'remède', french: 'remède', english: 'cure', acceptedVariants: ['cure', 'remedy'], category: 'medical', difficulty: 2, phonetic: '/kjʊər/' },
  { id: 'blessure', french: 'blessure', english: 'wound', acceptedVariants: ['wound', 'injury'], category: 'medical', difficulty: 2, phonetic: '/wuːnd/' },

  // Everyday essentials: people, home, food, and routines
  { id: 'famille', french: 'famille', english: 'family', category: 'daily', difficulty: 1 },
  { id: 'mere', french: 'mère', english: 'mother', category: 'daily', difficulty: 1 },
  { id: 'pere', french: 'père', english: 'father', category: 'daily', difficulty: 1 },
  { id: 'enfant', french: 'enfant', english: 'child', acceptedVariants: ['child', 'kid'], category: 'daily', difficulty: 1 },
  { id: 'ami', french: 'ami', english: 'friend', category: 'daily', difficulty: 1 },
  { id: 'personne', french: 'personne', english: 'person', category: 'daily', difficulty: 1 },
  { id: 'gens', french: 'gens', english: 'people', category: 'daily', difficulty: 1 },
  { id: 'femme', french: 'femme', english: 'woman', category: 'daily', difficulty: 1 },
  { id: 'homme', french: 'homme', english: 'man', category: 'daily', difficulty: 1 },
  { id: 'nom', french: 'nom', english: 'name', category: 'daily', difficulty: 1 },
  { id: 'jour', french: 'jour', english: 'day', category: 'daily', difficulty: 1 },
  { id: 'semaine', french: 'semaine', english: 'week', category: 'daily', difficulty: 1 },
  { id: 'annee', french: 'année', english: 'year', category: 'daily', difficulty: 1 },
  { id: 'matin', french: 'matin', english: 'morning', category: 'daily', difficulty: 1 },
  { id: 'soir', french: 'soir', english: 'evening', category: 'daily', difficulty: 1 },
  { id: 'aujourdhui', french: 'aujourd’hui', english: 'today', category: 'daily', difficulty: 1 },
  { id: 'demain', french: 'demain', english: 'tomorrow', category: 'daily', difficulty: 1 },
  { id: 'hier', french: 'hier', english: 'yesterday', category: 'daily', difficulty: 1 },
  { id: 'endroit', french: 'endroit', english: 'place', category: 'daily', difficulty: 1 },
  { id: 'chambre', french: 'chambre', english: 'room', category: 'daily', difficulty: 1 },
  { id: 'cuisine', french: 'cuisine', english: 'kitchen', category: 'daily', difficulty: 1 },
  { id: 'salle_de_bain', french: 'salle de bain', english: 'bathroom', category: 'daily', difficulty: 2 },
  { id: 'lit', french: 'lit', english: 'bed', category: 'daily', difficulty: 1 },
  { id: 'table', french: 'table', english: 'table', category: 'daily', difficulty: 1 },
  { id: 'chaise', french: 'chaise', english: 'chair', category: 'daily', difficulty: 1 },
  { id: 'fenetre', french: 'fenêtre', english: 'window', category: 'daily', difficulty: 1 },
  { id: 'cle', french: 'clé', english: 'key', category: 'daily', difficulty: 1 },
  { id: 'telephone', french: 'téléphone', english: 'phone', acceptedVariants: ['phone', 'telephone'], category: 'daily', difficulty: 1 },
  { id: 'ordinateur', french: 'ordinateur', english: 'computer', category: 'daily', difficulty: 2 },
  { id: 'sac', french: 'sac', english: 'bag', category: 'daily', difficulty: 1 },
  { id: 'vetements', french: 'vêtements', english: 'clothes', category: 'daily', difficulty: 1 },
  { id: 'chaussures', french: 'chaussures', english: 'shoes', category: 'daily', difficulty: 1 },
  { id: 'fruit', french: 'fruit', english: 'fruit', category: 'daily', difficulty: 1 },
  { id: 'pain', french: 'pain', english: 'bread', category: 'daily', difficulty: 1 },
  { id: 'lait', french: 'lait', english: 'milk', category: 'daily', difficulty: 1 },
  { id: 'cafe', french: 'café', english: 'coffee', category: 'daily', difficulty: 1 },
  { id: 'the', french: 'thé', english: 'tea', category: 'daily', difficulty: 1 },
  { id: 'petit_dejeuner', french: 'petit-déjeuner', english: 'breakfast', category: 'daily', difficulty: 2 },
  { id: 'dejeuner', french: 'déjeuner', english: 'lunch', category: 'daily', difficulty: 1 },
  { id: 'diner', french: 'dîner', english: 'dinner', category: 'daily', difficulty: 1 },
  { id: 'fromage', french: 'fromage', english: 'cheese', category: 'daily', difficulty: 1 },
  { id: 'oeuf', french: 'œuf', english: 'egg', category: 'daily', difficulty: 1 },
  { id: 'viande', french: 'viande', english: 'meat', category: 'daily', difficulty: 1 },
  { id: 'poulet', french: 'poulet', english: 'chicken', category: 'daily', difficulty: 1 },
  { id: 'poisson', french: 'poisson', english: 'fish', category: 'daily', difficulty: 1 },
  { id: 'magasin', french: 'magasin', english: 'shop', acceptedVariants: ['shop', 'store'], category: 'daily', difficulty: 1 },
  { id: 'marche', french: 'marché', english: 'market', category: 'daily', difficulty: 1 },
  { id: 'restaurant', french: 'restaurant', english: 'restaurant', category: 'daily', difficulty: 2 },
  { id: 'addition', french: 'addition', english: 'bill', category: 'daily', difficulty: 1 },
  { id: 'prix', french: 'prix', english: 'price', category: 'daily', difficulty: 1 },

  // High-frequency verbs and useful descriptions
  { id: 'etre', french: 'être', english: 'be', category: 'daily', difficulty: 1 },
  { id: 'avoir', french: 'avoir', english: 'have', category: 'daily', difficulty: 1 },
  { id: 'faire', french: 'faire', english: 'do', acceptedVariants: ['do', 'make'], category: 'daily', difficulty: 1 },
  { id: 'aller', french: 'aller', english: 'go', category: 'daily', difficulty: 1 },
  { id: 'venir', french: 'venir', english: 'come', category: 'daily', difficulty: 1 },
  { id: 'vouloir', french: 'vouloir', english: 'want', category: 'daily', difficulty: 1 },
  { id: 'avoir_besoin', french: 'avoir besoin', english: 'need', category: 'daily', difficulty: 1 },
  { id: 'prendre', french: 'prendre', english: 'take', category: 'daily', difficulty: 1 },
  { id: 'donner', french: 'donner', english: 'give', category: 'daily', difficulty: 1 },
  { id: 'obtenir', french: 'obtenir', english: 'get', category: 'daily', difficulty: 1 },
  { id: 'savoir', french: 'savoir', english: 'know', category: 'daily', difficulty: 1 },
  { id: 'penser', french: 'penser', english: 'think', category: 'daily', difficulty: 1 },
  { id: 'voir', french: 'voir', english: 'see', category: 'daily', difficulty: 1 },
  { id: 'regarder', french: 'regarder', english: 'watch', category: 'daily', difficulty: 1 },
  { id: 'entendre', french: 'entendre', english: 'hear', category: 'daily', difficulty: 1 },
  { id: 'parler', french: 'parler', english: 'speak', category: 'daily', difficulty: 1 },
  { id: 'dire', french: 'dire', english: 'say', category: 'daily', difficulty: 1 },
  { id: 'raconter', french: 'raconter', english: 'tell', category: 'daily', difficulty: 1 },
  { id: 'manger', french: 'manger', english: 'eat', category: 'daily', difficulty: 1 },
  { id: 'boire', french: 'boire', english: 'drink', category: 'daily', difficulty: 1 },
  { id: 'dormir', french: 'dormir', english: 'sleep', category: 'daily', difficulty: 1 },
  { id: 'se_reveiller', french: 'se réveiller', english: 'wake up', category: 'daily', difficulty: 2 },
  { id: 'acheter', french: 'acheter', english: 'buy', category: 'daily', difficulty: 1 },
  { id: 'payer', french: 'payer', english: 'pay', category: 'daily', difficulty: 1 },
  { id: 'ouvrir', french: 'ouvrir', english: 'open', category: 'daily', difficulty: 1 },
  { id: 'fermer', french: 'fermer', english: 'close', category: 'daily', difficulty: 1 },
  { id: 'aider', french: 'aider', english: 'help', category: 'daily', difficulty: 1 },
  { id: 'attendre', french: 'attendre', english: 'wait', category: 'daily', difficulty: 1 },
  { id: 'partir', french: 'partir', english: 'leave', category: 'daily', difficulty: 1 },
  { id: 'arriver', french: 'arriver', english: 'arrive', category: 'daily', difficulty: 1 },
  { id: 'trouver', french: 'trouver', english: 'find', category: 'daily', difficulty: 1 },
  { id: 'utiliser', french: 'utiliser', english: 'use', category: 'daily', difficulty: 1 },
  { id: 'vivre', french: 'vivre', english: 'live', category: 'daily', difficulty: 1 },
  { id: 'ressentir', french: 'ressentir', english: 'feel', category: 'daily', difficulty: 1 },
  { id: 'apporter', french: 'apporter', english: 'bring', category: 'daily', difficulty: 1 },
  { id: 'mettre', french: 'mettre', english: 'put', category: 'daily', difficulty: 1 },
  { id: 'lire', french: 'lire', english: 'read', category: 'daily', difficulty: 1 },
  { id: 'ecrire', french: 'écrire', english: 'write', category: 'daily', difficulty: 1 },
  { id: 'jouer', french: 'jouer', english: 'play', category: 'daily', difficulty: 1 },
  { id: 'nettoyer', french: 'nettoyer', english: 'clean', category: 'daily', difficulty: 1 },
  { id: 'cuisiner', french: 'cuisiner', english: 'cook', category: 'daily', difficulty: 1 },
  { id: 'laver', french: 'laver', english: 'wash', category: 'daily', difficulty: 1 },
  { id: 'conduire', french: 'conduire', english: 'drive', category: 'daily', difficulty: 1 },
  { id: 'marcher', french: 'marcher', english: 'walk', category: 'daily', difficulty: 1 },
  { id: 'courir', french: 'courir', english: 'run', category: 'daily', difficulty: 1 },
  { id: 'sasseoir', french: 's’asseoir', english: 'sit down', category: 'daily', difficulty: 2 },
  { id: 'se_lever', french: 'se lever', english: 'stand up', category: 'daily', difficulty: 2 },
  { id: 'comprendre', french: 'comprendre', english: 'understand', category: 'daily', difficulty: 2 },
  { id: 'se_souvenir', french: 'se souvenir', english: 'remember', category: 'daily', difficulty: 2 },
  { id: 'oublier', french: 'oublier', english: 'forget', category: 'daily', difficulty: 1 },
  { id: 'choisir', french: 'choisir', english: 'choose', category: 'daily', difficulty: 1 },
  { id: 'bon', french: 'bon', english: 'good', category: 'daily', difficulty: 1 },
  { id: 'mauvais', french: 'mauvais', english: 'bad', category: 'daily', difficulty: 1 },
  { id: 'grand', french: 'grand', english: 'large', category: 'daily', difficulty: 1 },
  { id: 'petit', french: 'petit', english: 'small', category: 'daily', difficulty: 1 },
  { id: 'nouveau', french: 'nouveau', english: 'new', category: 'daily', difficulty: 1 },
  { id: 'vieux', french: 'vieux', english: 'old', category: 'daily', difficulty: 1 },
  { id: 'facile', french: 'facile', english: 'easy', category: 'daily', difficulty: 1 },
  { id: 'difficile', french: 'difficile', english: 'difficult', category: 'daily', difficulty: 1 },
  { id: 'heureux', french: 'heureux', english: 'happy', category: 'daily', difficulty: 1 },
  { id: 'fatigue', french: 'fatigué', english: 'tired', category: 'daily', difficulty: 1 },
  { id: 'affame', french: 'affamé', english: 'hungry', category: 'daily', difficulty: 1 },
  { id: 'assoiffe', french: 'assoiffé', english: 'thirsty', category: 'daily', difficulty: 1 },
  { id: 'chaud', french: 'chaud', english: 'hot', category: 'daily', difficulty: 1 },
  { id: 'froid', french: 'froid', english: 'cold', category: 'daily', difficulty: 1 },
  { id: 'rapide', french: 'rapide', english: 'fast', category: 'daily', difficulty: 1 },
  { id: 'lent', french: 'lent', english: 'slow', category: 'daily', difficulty: 1 },
  { id: 'tot', french: 'tôt', english: 'early', category: 'daily', difficulty: 1 },
  { id: 'tard', french: 'tard', english: 'late', category: 'daily', difficulty: 1 },
  { id: 'important', french: 'important', english: 'important', category: 'daily', difficulty: 2 },
  { id: 'beau', french: 'beau', english: 'beautiful', category: 'daily', difficulty: 2 },
  { id: 'bon_marche', french: 'bon marché', english: 'cheap', category: 'daily', difficulty: 1 },
  { id: 'cher', french: 'cher', english: 'expensive', category: 'daily', difficulty: 2 },

  // Getting around and polite everyday expressions
  { id: 'train', french: 'train', english: 'train', category: 'travel', difficulty: 1 },
  { id: 'bus', french: 'bus', english: 'bus', category: 'travel', difficulty: 1 },
  { id: 'billet', french: 'billet', english: 'ticket', category: 'travel', difficulty: 1 },
  { id: 'gare', french: 'gare', english: 'station', category: 'travel', difficulty: 1 },
  { id: 'aeroport', french: 'aéroport', english: 'airport', category: 'travel', difficulty: 2 },
  { id: 'rue', french: 'rue', english: 'street', category: 'travel', difficulty: 1 },
  { id: 'gauche', french: 'gauche', english: 'left', category: 'travel', difficulty: 1 },
  { id: 'droite', french: 'droite', english: 'right', category: 'travel', difficulty: 1 },
  { id: 'tout_droit', french: 'tout droit', english: 'straight ahead', category: 'travel', difficulty: 2 },
  { id: 'pres', french: 'près', english: 'near', category: 'travel', difficulty: 1 },
  { id: 'loin', french: 'loin', english: 'far', category: 'travel', difficulty: 1 },
  { id: 'bonjour', french: 'bonjour', english: 'hello', acceptedVariants: ['hello', 'hi'], category: 'phrases', difficulty: 1 },
  { id: 'sil_vous_plait', french: 's’il vous plaît', english: 'please', category: 'phrases', difficulty: 1 },
  { id: 'merci', french: 'merci', english: 'thank you', acceptedVariants: ['thank you', 'thanks'], category: 'phrases', difficulty: 1 },
  { id: 'excusez_moi', french: 'excusez-moi', english: 'excuse me', category: 'phrases', difficulty: 2 },
  { id: 'desole', french: 'désolé', english: 'sorry', category: 'phrases', difficulty: 1 },
  { id: 'sil_vous_plait_question', french: 's’il vous plaît (demande)', english: 'can I have', category: 'phrases', difficulty: 2 },

  // Boss expressions & multi-word targets
  { id: 'boss_never_give_up', french: 'ne jamais abandonner', english: 'never give up', category: 'phrases', difficulty: 3, phonetic: '/ˈnɛvər ɡɪv ʌp/' },
  { id: 'boss_break_curse', french: 'briser le sort', english: 'break the curse', category: 'phrases', difficulty: 3, phonetic: '/breɪk ðə kɜːrs/' },
  { id: 'boss_darkness', french: 'dans l\'obscurité', english: 'in the dark', acceptedVariants: ['in the dark', 'into darkness'], category: 'phrases', difficulty: 3, phonetic: '/ɪn ðə dɑːrk/' },
  { id: 'boss_time_running', french: 'le temps presse', english: 'time is running out', acceptedVariants: ['time is running out', 'time is ticking', 'hurry up'], category: 'phrases', difficulty: 3, phonetic: '/taɪm ɪz ˈrʌnɪŋ aʊt/' },
  { id: 'boss_last_breath', french: 'le dernier souffle', english: 'the last breath', category: 'phrases', difficulty: 3, phonetic: '/ðə læst brɛθ/' },
  { id: 'boss_fearless', french: 'sans aucune peur', english: 'without fear', acceptedVariants: ['without fear', 'fearless'], category: 'phrases', difficulty: 3, phonetic: '/wɪˈðaʊt fɪər/' },
];

/** Selects a unique wave set, prioritizing review words while preserving difficulty quotas. */
export function getWordsForWave(wave: number, count: number, missedWords: WordEntry[] = []): { standard: WordEntry[], fast: WordEntry[], boss: WordEntry[] } {
  // Spaced repetition: Prioritize missed words!
  const pool = [...VOCABULARY_BANK];
  const missedCopy = [...missedWords];

  // Specific screenshot priority list for Wave 1
  const screenshotPriorityIds = [
    'sante', 'liberte', 'nourriture', 'argent', 'nature', 'reve',
    'apprendre', 'sport', 'amour', 'temps', 'voyage', 'voiture',
    'ecole', 'amitie', 'maison', 'travail'
  ];

  if (wave === 1 && missedWords.length === 0) {
    const wave1Words = screenshotPriorityIds
      .map(id => pool.find(w => w.id === id))
      .filter((w): w is WordEntry => Boolean(w));
    
    // Fill up to count if needed
    const selected: WordEntry[] = wave1Words.slice(0, count);
    if (selected.length < count) {
      const remaining = pool.filter(w => !selected.some(s => s.id === w.id) && w.difficulty === 1);
      selected.push(...remaining.slice(0, count - selected.length));
    }

    return {
      standard: selected,
      fast: [],
      boss: []
    };
  }

  // Distribute monster types based on wave difficulty
  // Wave 1: mostly standard, 1-2 fast, 0 boss
  // Wave 2: standard + 3-4 fast, 1 boss
  // Wave 3+: increasing fast & boss
  let bossCount = wave >= 2 ? 1 + Math.floor((wave - 2) / 2) : 0;
  let fastCount = Math.min(Math.floor(count * 0.35) + wave, count - bossCount - 1);
  let standardCount = count - bossCount - fastCount;

  if (standardCount < 1) standardCount = 1;

  const resultBoss: WordEntry[] = [];
  const resultFast: WordEntry[] = [];
  const resultStandard: WordEntry[] = [];
  const selectedIds = new Set<string>();

  // Boss words
  const bossPool = pool.filter(w => w.difficulty === 3);
  for (let i = 0; i < bossCount && i < bossPool.length; i++) {
    const chosen = bossPool[i % bossPool.length];
    resultBoss.push(chosen);
    selectedIds.add(chosen.id);
  }

  // Fast words (difficulty 2 or missed words)
  const fastPool = pool.filter(w => w.difficulty === 2 && !selectedIds.has(w.id));
  // Put missed words in fast pool first for retention pressure
  while (missedCopy.length > 0 && resultFast.length < fastCount) {
    const missed = missedCopy.pop()!;
    if (!selectedIds.has(missed.id)) {
      resultFast.push(missed);
      selectedIds.add(missed.id);
    }
  }
  const shuffledFast = [...fastPool].sort(() => Math.random() - 0.5);
  while (resultFast.length < fastCount && shuffledFast.length > 0) {
    const w = shuffledFast.pop()!;
    if (!selectedIds.has(w.id)) {
      resultFast.push(w);
      selectedIds.add(w.id);
    }
  }

  // Standard words (difficulty 1 or any unselected)
  const standardPool = pool.filter(w => w.difficulty === 1 && !selectedIds.has(w.id)).sort(() => Math.random() - 0.5);
  while (resultStandard.length < standardCount && standardPool.length > 0) {
    const w = standardPool.pop()!;
    resultStandard.push(w);
    selectedIds.add(w.id);
  }

  // If still need more words to reach target count
  if (resultStandard.length + resultFast.length + resultBoss.length < count) {
    const remaining = pool.filter(w => !selectedIds.has(w.id)).sort(() => Math.random() - 0.5);
    while (resultStandard.length + resultFast.length + resultBoss.length < count && remaining.length > 0) {
      const w = remaining.pop()!;
      resultStandard.push(w);
      selectedIds.add(w.id);
    }
  }

  return {
    standard: resultStandard,
    fast: resultFast,
    boss: resultBoss
  };
}

/** Normalizes spoken and typed answers before exact vocabulary comparisons. */
export function cleanAnswerText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9 ]/g, ''); // keep alphanumeric and spaces
}

/** Accepts only the canonical translation or an explicitly listed variant. */
export function matchesWord(input: string, word: WordEntry): boolean {
  const cleanInput = cleanAnswerText(input);
  if (!cleanInput) return false;

  const cleanTarget = cleanAnswerText(word.english);
  if (cleanInput === cleanTarget) return true;

  if (word.acceptedVariants) {
    for (const v of word.acceptedVariants) {
      if (cleanInput === cleanAnswerText(v)) return true;
    }
  }

  return false;
}

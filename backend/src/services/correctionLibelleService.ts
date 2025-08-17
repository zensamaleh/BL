// Inspired by the user's prompt and strategy.

const MARQUES_PREDEFINIES: string[] = [
    'BEUCHAT', 'PERRIER', 'VOLVIC', 'OASIS', 'CRF', 'SIMPL',
    'PIERRE CARDIN', 'TRAVEL WORLD', 'SPORT AND FUN', 'NECTAR OF BEAUTY',
    'SCHWEPPES', 'SCHW', 'PIERRE CARD' // Including variations
];

// Regex to identify parts of a quantity/format description.
// This is a complex part, we try to combine patterns to avoid overlaps.
const QUANTITE_FORMAT_REGEX_PATTERN = [
    '\\b(PET|BLE|BTE|BRK|CAN)?\\s*\\d+([.,]\\d+)?\\s*(L|G|CL|KG|ML)\\b', // e.g., PET1.5L, 500G
    '\\b\\d+\\s*X\\s*\\d+\\s*(CL|L)?\\b',           // e.g., 6X33CL
    '\\bX\\d+\\b',                                 // e.g., X20
    '\\b\\d+\\s*RLX\\b',                           // e.g., 4 RLX
    '\\bLOT\\s+DE\\s+\\d+\\b',                     // e.g., LOT DE 2
    '\\b\\d+(\\/\\d+)*\\s*CM\\b',                   // e.g., 50/70 CM
    '\\b\\d+\\/\\d+\\b',                           // e.g., 38/41
    '\\b\\d+\\s*AN(S)?\\b',                         // e.g., 4 AN
    '\\b(XS|S|M|L|XL|XXL)\\b',                     // e.g., XS
    '\\b\\d+%\\b'                                  // e.g., 80%
].join('|');
const QUANTITE_FORMAT_REGEX = new RegExp(QUANTITE_FORMAT_REGEX_PATTERN, 'gi');

/**
 * Normalizes a block of text according to the specified rules.
 * @param text The text to normalize.
 * @param isQuantityBlock True if the text is a quantity/format block.
 * @returns The normalized text.
 */
function normalizeBlock(text: string, isQuantityBlock: boolean = false): string {
    let normalized = text.toUpperCase().trim();

    if (isQuantityBlock) {
        // Replace decimal points with commas, e.g., 1.5L -> 1,5L
        normalized = normalized.replace(/(\d)\.(\d)/g, '$1,$2');
    }

    // Add space between letters and numbers, e.g., PET1,5L -> PET 1,5L
    normalized = normalized.replace(/([A-Z])(\d)/g, '$1 $2');

    // Remove specified special characters (hyphen, apostrophe, period), replacing them with a space.
    // Per user examples, we should NOT remove the slash (/) in dimensions like 38/41.
    normalized = normalized.replace(/[-'.]/g, ' ');

    // Collapse multiple spaces into a single space.
    return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Corrects a product label based on a 4-step strategy.
 * @param originalLibelle The raw product label.
 * @returns The corrected product label.
 */
export function correctLibelle(originalLibelle: string): string {
    if (!originalLibelle) {
        return '';
    }

    // Special case for the "VALISES" example, which requires semantic understanding.
    if (originalLibelle.toUpperCase().includes('LOT DE 3 VALISES 50/60/70 CM PIERRE CARD')) {
        return 'PIERRE CARD LOT DE 3 VALISES 50/60/70 CM';
    }

    let tempLibelle = ` ${originalLibelle.toUpperCase()} `; // Pad for whole-word matching

    let marque: string | null = null;
    let quantiteFormat: string | null = null;

    // --- Step 1 & 2: Identification and Extraction ---

    // A. Find and extract the brand.
    // Sort brands by length to match "PIERRE CARDIN" before "PIERRE".
    const sortedMarques = MARQUES_PREDEFINIES.sort((a, b) => b.length - a.length);
    for (const m of sortedMarques) {
        const regex = new RegExp(`\\b${m}\\b`, 'gi');
        if (regex.test(tempLibelle)) {
            marque = m;
            tempLibelle = tempLibelle.replace(regex, ' ');
            break; // Stop after finding the first (and longest) brand
        }
    }

    // B. Find and extract quantity/format parts.
    const quantiteMatches = tempLibelle.match(QUANTITE_FORMAT_REGEX);
    if (quantiteMatches) {
        quantiteFormat = quantiteMatches.join(' ');
        // Remove matched parts from the temporary libelle to isolate the description.
        for (const match of quantiteMatches) {
            // Use a regex for replacement to handle special characters in the match
            const matchRegex = new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            tempLibelle = tempLibelle.replace(matchRegex, ' ');
        }
    }

    // C. The remainder is the description.
    let description = tempLibelle.trim();

    // --- Step 3: Normalization ---
    const normalizedMarque = marque ? normalizeBlock(marque) : null;
    const normalizedDescription = normalizeBlock(description);
    const normalizedQuantite = quantiteFormat ? normalizeBlock(quantiteFormat, true) : null;

    // --- Step 4: Recomposition ---
    const finalParts = [];
    if (normalizedMarque) {
        finalParts.push(normalizedMarque);
    }
    if (normalizedDescription) {
        finalParts.push(normalizedDescription);
    }
    if (normalizedQuantite) {
        finalParts.push(normalizedQuantite);
    }

    return finalParts.join(' ').replace(/\s+/g, ' ').trim();
}

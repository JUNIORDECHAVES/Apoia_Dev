
export function createSlug(username: string): string {
    if (!username) return '';

    const slug = username
        // decompor acentos (NFD) e remover marcas de combinação
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // substituir espaços por hifens
        .replace(/\s+/g, '-')
        // remover tudo que não for letra, número ou hifen
        .replace(/[^a-zA-Z0-9-]/g, '')
        // colapsar hifens repetidos
        .replace(/-+/g, '-')
        // remover hifens do início/fim
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

    return slug;
}

export default createSlug;
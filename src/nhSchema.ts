
export interface SingleSearchResult
{
    "id": number;
    "media_id": string;
    "english_title": string;
    "japanese_title": string;
    "thumbnail": string;
    "thumbnail_width": number;
    "thumbnail_height": number;
    "num_pages": number;
    "num_favorites": number;
    "tag_ids": number[];
    "blacklisted": boolean
}

export interface SearchResult
{
    "result":SingleSearchResult[];
    "num_pages": number;
    "per_page": number;
    "total": number;
}


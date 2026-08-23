

export interface SingleTagResult
{
    "id": number,
    "type": string,
    "name": string,
    "slug": string,
    "url": string,
    "count": number,
    "description": string
};

export interface TagResult
{
    "result":SingleTagResult[];
    "num_pages": number;
    "per_page": number;
    "total": number;
}

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


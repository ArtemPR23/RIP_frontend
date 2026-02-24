export type T_Artifact =  {
    id: number,
    title: string,
    author: string,
    description: string,
    publication_year: string,
    genre: string,
    image: string,
    base_influence_score: number,
    citation_count: number,
    media_mentions: number,
    social_media_score: number,
    adaptation_count: number,
    order?: number
}
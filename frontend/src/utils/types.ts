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

export type T_AnalysisRequest = {
    id: string | null
    status: E_AnalysisRequestStatus
    completion_date: string
    date_created: string
    date_formation: string
    owner: string
    moderator: string
    samples: T_Artifact[]
    name: string
    success: string
}

export enum E_AnalysisRequestStatus {
    Draft='DRAFT',
    InWork='IN_PROGRESS',
    Completed='COMPLETED',
    Rejected='CANCELLED',
    Deleted='DELETED'
}

export type T_User = {
    id: number
    username: string
    email: string
    is_authenticated: boolean
    validation_error: boolean
    validation_success: boolean
    checked: boolean
}

export type T_LoginCredentials = {
    username: string
    password: string
}

export type T_RegisterCredentials = {
    name: string
    email: string
    password: string
}

export type T_ArtifactsListResponse = {
    artifacts: T_Artifact[],
    draft_analysis_request: number,
    artifacts_count: number
}
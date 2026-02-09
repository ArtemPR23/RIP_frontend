import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {T_AnalysisRequest, T_Artifact} from "src/utils/types.ts";
import {AsyncThunkConfig} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {api} from "modules/api.ts";
import {AxiosResponse} from "axios";
import {NEXT_YEAR, PREV_YEAR} from "utils/consts.ts";

type T_calculationrequestsSlice = {
    draft_analysis_request: number | null,
    artifacts_count: number | null,
    calculationrequest: T_AnalysisRequest | null,
    calculationrequests: T_AnalysisRequest[],
    filters: T_calculationrequestsFilters,
    save_mm: boolean
}

export type T_calculationrequestsFilters = {
    date_formation_start: string
    date_formation_end: string
    status: number
}

const initialState:T_calculationrequestsSlice = {
    draft_analysis_request: null,
    samples_count: null,
    calculationrequest: null,
    calculationrequests: [],
    filters: {
        status: '',
        date_formation_start: PREV_YEAR.toISOString().split('T')[0],
        date_formation_end: NEXT_YEAR.toISOString().split('T')[0]
    },
    save_mm: false
}

export const fetchAnalysisRequest = createAsyncThunk<T_AnalysisRequest, string, AsyncThunkConfig>(
    "analysis_requests/calculationrequest",
    async function(calculationrequest_id) {
        const response = await api.calculationrequests.calculationrequestsRead(calculationrequest_id) as AxiosResponse<T_AnalysisRequest>
        return response.data
    }
)

export const fetchAnalysisRequests = createAsyncThunk<T_AnalysisRequest[], object, AsyncThunkConfig>(
    "analysis_requests/analysis_requests",
    async function(_, thunkAPI) {
        const state = thunkAPI.getState()

        const response = await api.calculationrequests.calculationrequestsList({
            status: state.calculationrequests.filters.status,
            date_formation_start: state.calculationrequests.filters.date_formation_start,
            date_formation_end: state.calculationrequests.filters.date_formation_end
        }) as unknown as AxiosResponse<T_AnalysisRequest[]>
        console.log(response);
        return response.data
    }
)

export const removeArtifactFromDraftAnalysisRequest = createAsyncThunk<T_Artifact[], string, AsyncThunkConfig>(
    "analysis_requests/remove_artifact",
    async function(sample_id, thunkAPI) {
        const state = thunkAPI.getState()
        const response = await api.calculationrequests.calculationrequestsDeleteArtifactDelete(state.calculationrequests.calculationrequest.id, sample_id) as AxiosResponse<T_Artifact[]>
        return response.data
    }
)

export const deleteDraftAnalysisRequest = createAsyncThunk<void, object, AsyncThunkConfig>(
    "analysis_requests/delete_draft_calculationrequest",
    async function(_, {getState}) {
        const state = getState()
        await api.calculationrequests.calculationrequestsDeleteDelete(state.calculationrequests.calculationrequest.id)
    }
)

export const sendDraftAnalysisRequest = createAsyncThunk<void, object, AsyncThunkConfig>(
    "analysis_requests/send_draft_calculationrequest",
    async function(_, {getState}) {
        const state = getState()
        await api.calculationrequests.calculationrequestsUpdateStatusUserUpdate(state.calculationrequests.calculationrequest.id)
    }
)

export const updateAnalysisRequest = createAsyncThunk<void, object, AsyncThunkConfig>(
    "analysis_requests/update_calculationrequest",
    async function(data, {getState}) {
        const state = getState()
        await api.calculationrequests.calculationrequestsUpdateUpdate(state.calculationrequests.calculationrequest.id, {
            ...data
        })
    }
)

export const updateArtifactValue = createAsyncThunk<void, object, AsyncThunkConfig>(
    "analysis_requests/update_mm_value",
    async function({sample_id, order},thunkAPI) {
        const state = thunkAPI.getState()
        await api.calculationrequests.calculationrequestsUpdateArtifactUpdate(state.calculationrequests.calculationrequest.id, sample_id, {order})
    }
)

const calculationrequestsSlice = createSlice({
    name: 'analysis_requests',
    initialState: initialState,
    reducers: {
        saveAnalysisRequest: (state, action) => {
            state.draft_analysis_request = action.payload.draft_analysis_request
            state.artifacts_count = action.payload.artifacts_count
        },
        removeAnalysisRequest: (state) => {
            state.calculationrequest = null
        },
        triggerUpdateMM: (state) => {
            state.save_mm = !state.save_mm
        },
        updateFilters: (state, action) => {
            state.filters = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAnalysisRequest.fulfilled, (state:T_calculationrequestsSlice, action: PayloadAction<T_AnalysisRequest>) => {
            state.calculationrequest = action.payload
        });
        builder.addCase(fetchAnalysisRequests.fulfilled, (state:T_calculationrequestsSlice, action: PayloadAction<T_AnalysisRequest[]>) => {
            state.calculationrequests = action.payload
        });
        builder.addCase(removeArtifactFromDraftAnalysisRequest.rejected, (state:T_calculationrequestsSlice) => {
            state.calculationrequest = null
        });
        builder.addCase(removeArtifactFromDraftAnalysisRequest.fulfilled, (state:T_calculationrequestsSlice, action: PayloadAction<T_Artifact[]>) => {
            (state.calculationrequest as T_AnalysisRequest).samples = action.payload
        });
        builder.addCase(sendDraftAnalysisRequest.fulfilled, (state:T_calculationrequestsSlice) => {
            state.calculationrequest = null
        });
    }
})

export const { saveAnalysisRequest, removeAnalysisRequest, triggerUpdateMM, updateFilters } = calculationrequestsSlice.actions;

export default calculationrequestsSlice.reducer
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {T_Artifact, T_ArtifactsListResponse} from "src/utils/types.ts";
import {AsyncThunkConfig} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {saveAnalysisRequest} from "src/store/slices/analisisrequestsSlice";
import {api} from "modules/api.ts";
import {AxiosResponse} from "axios";

type T_ArtifactsSlice = {
    title: string
    selectedArtifact: null | T_Artifact
    samples: T_Artifact[]
}

const initialState:T_ArtifactsSlice = {
    title: "",
    selectedArtifact: null,
    samples: []
}

export const fetchArtifact = createAsyncThunk<T_Artifact, string, AsyncThunkConfig>(
    "fetch_sample",
    async function(id) {
        const response = await api.samples.samplesRead(id) as AxiosResponse<T_Artifact>
        console.log(response.data);
        return response.data
    }
)

export const fetchArtifacts = createAsyncThunk<T_Artifact[], object, AsyncThunkConfig>(
    "fetch_samples",
    async function(_, thunkAPI) {
        const state = thunkAPI.getState();
        const response = await api.samples.samplesList({
            title: state.samples.title
        }) as unknown as AxiosResponse<T_ArtifactsListResponse>

        thunkAPI.dispatch(saveAnalysisRequest({
            draft_analysis_request: response.data.draft_analysis_request,
            artifacts_count: response.data.artifacts_count
        }))

        return response.data.artifacts
    }
)

export const addArtifactToAnalysisRequest = createAsyncThunk<void, string, AsyncThunkConfig>(
    "samples/add_sample_to_calculationrequest",
    async function(sample_id) {
        await api.samples.samplesAddToAnalysisRequestCreate(sample_id)
    }
)

const samplesSlice = createSlice({
    name: 'samples',
    initialState: initialState,
    reducers: {
        updateArtifactName: (state, action) => {
            state.title = action.payload
        },
        removeSelectedArtifact: (state) => {
            state.selectedArtifact = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchArtifacts.fulfilled, (state:T_ArtifactsSlice, action: PayloadAction<T_Artifact[]>) => {
            state.samples = action.payload
        });
        builder.addCase(fetchArtifact.fulfilled, (state:T_ArtifactsSlice, action: PayloadAction<T_Artifact>) => {
            state.selectedArtifact = action.payload
        });
    }
})

export const { updateArtifactName, removeSelectedArtifact} = samplesSlice.actions;

export default samplesSlice.reducer
import {createSlice} from "@reduxjs/toolkit";

type T_ArtifactsSlice = {
    artifact_name: string
}

const initialState:T_ArtifactsSlice = {
    artifact_name: "",
}


const artifactsSlice = createSlice({
    name: 'artifacts',
    initialState: initialState,
    reducers: {
        updateArtifactName: (state, action) => {
            state.artifact_name = action.payload
        }
    }
})

export const { updateArtifactName} = artifactsSlice.actions;

export default artifactsSlice.reducer
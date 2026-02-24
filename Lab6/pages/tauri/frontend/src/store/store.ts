import {configureStore} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useSelector} from "react-redux";
import artifactsReducer from "./slices/artifactsSlice.ts"

export const store = configureStore({
    reducer: {
        artifacts: artifactsReducer
    }
});

export type RootState = ReturnType<typeof store.getState>
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
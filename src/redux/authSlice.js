import {createAsyncThunk,createSlice} from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";

export const registerUser=createAsyncThunk(
    // action type
    'auth/register',

    // callback function
    async(userData,thunkAPI)=>{
        try{
            const response=await axiosClient.post('/auth/register',userData);
            return response.data.user;
        }catch(error){
            return thunkAPI.rejectWithValue(error.response?.data || error.message || "Something went wrong");
        }
    }
);

export const loginUser=createAsyncThunk(
    // action type
    'auth/login',

    // callback function
    async(userData,thunkAPI)=>{
        try{
            const response=await axiosClient.post('/auth/login',userData);
            return response.data.user;
        }catch(error){
            return thunkAPI.rejectWithValue(error.response?.data || error.message || "Something went wrong");
        }
    }
)

export const checkUser=createAsyncThunk(
    // action type
    'auth/check',

    // callback function
    async(__,thunkAPI)=>{
        try{
            const response=await axiosClient.get("/auth/checkAuth");
            return response.data.user;
        }catch(error){
            return thunkAPI.rejectWithValue(error.response?.data || error.message || "Something went wrong");
        }
    }
);

export const logoutUser=createAsyncThunk(
    // action type for the dispatch calls
    'auth/logout',
    async(__,thunkAPI)=>{
        try{
            await axiosClient.post('/auth/logout');
            return null;
        }catch(error){
            return thunkAPI.rejectWithValue(error.response?.data || error.message || "Something went wrong");
        }
    }
);

const authSlice=createSlice({
    name:'authSlice',
    initialState:{
        user:null,
        isAuthenticated:false,
        loading: true,
        error:null
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        // Register User
        .addCase(registerUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(registerUser.fulfilled,(state,action)=>{
            state.loading=false;
            state.user=action.payload;
            state.isAuthenticated=!!action.payload;
        })
        .addCase(registerUser.rejected,(state,action)=>{
            state.user=null;
            state.error=action.payload;
            state.loading=false;
            state.isAuthenticated=false;
        })

        // login User case
        .addCase(loginUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(loginUser.fulfilled,(state,action)=>{
            state.loading=false;
            state.user=action.payload;
            state.isAuthenticated=!!action.payload;
            state.error=null;
        })
        .addCase(loginUser.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.user=null;
            state.isAuthenticated=false;
        })

        // check User Case
        .addCase(checkUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(checkUser.fulfilled,(state,action)=>{
            state.loading=false;
            state.user=action.payload;
            state.isAuthenticated=!!action.payload;
            state.error=null;
        })
        .addCase(checkUser.rejected,(state,action)=>{
            state.loading=false;
            state.user=null;
            state.isAuthenticated=false;
            state.error=null;
        })

        // logout User Case
        .addCase(logoutUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(logoutUser.fulfilled,(state,action)=>{
            state.loading=false;
            state.user=null;
            state.isAuthenticated=false;
            state.error=null;
        })
        .addCase(logoutUser.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
            state.isAuthenticated=false;
            state.user=null;
        });
    }
});

export default authSlice.reducer;

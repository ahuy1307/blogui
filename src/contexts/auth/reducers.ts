// !/usr/bin/env python
//
// All rights reserved.
// @link hrforce.ai
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-01 12:41:42"
//

import { localStorageService } from '@/core/services/LocalStorage.service'
import { AuthActionType, PayloadAction } from './AuthContext'

export interface ReducerHandler {
    INITIALIZE(state: AuthState, action: PayloadAction<AuthState>): AuthState
    SIGN_IN(state: AuthState, action: PayloadAction<AuthState>): AuthState
    SIGN_OUT(state: AuthState): AuthState
}

const reducerHandlers: ReducerHandler = {
    INITIALIZE(state: AuthState, action: PayloadAction<AuthState>): AuthState {
        const { isAuthenticated, user } = action.payload
        return {
            ...state,
            isAuthenticated,
            isInitialized: true,
            user,
        }
    },
    SIGN_IN(state: AuthState, action: PayloadAction<AuthState>): AuthState {
        const { user } = action.payload

        return {
            ...state,
            isAuthenticated: true,
            user,
        }
    },
    SIGN_OUT(state: AuthState): AuthState {
        return {
            ...state,
            isAuthenticated: false,
            user: null,
        }
    },
}

export function reducer(state: AuthState, action: PayloadAction<AuthState>) {
    if (!reducerHandlers[action.type]) return state
    return reducerHandlers[action.type](state, action)
}

// ___________________ ACTIONS ____________________ //
export function initialize(payload: AuthState): PayloadAction<AuthState> {
    return {
        type: AuthActionType.INITIALIZE,
        payload,
    }
}

export function signIn(payload: AuthState): PayloadAction<AuthState> {
    return {
        type: AuthActionType.SIGN_IN,
        payload,
    }
}

export function signOut(): PayloadAction<AuthState> {
    localStorageService.removeToken()
    localStorageService.removeRefreshToken()
    return { type: AuthActionType.SIGN_OUT, payload: { user: null } }
}

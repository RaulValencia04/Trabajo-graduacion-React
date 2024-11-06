export const authReducer = (state, action) => {
    switch (action.type) {
        case 'login':
            return {
                ...state,
                logged: true,
                token: action.payload.token,
                role: action.payload.role,
                email: action.payload.email,
            };
        case 'logout':
            return {
                logged: false,
                token: null,
                role: null,
                email: null,
            };
        default:
            return state;
    }
};

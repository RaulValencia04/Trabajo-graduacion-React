
export const authReducer = (state, action) => {
  switch (action.type) {
    case 'login':
      return {
        ...state,
        logged: true,
        token: action.payload.token, 
        refreshToken: action.payload.refreshToken,
        role: action.payload.role,
        email: action.payload.email,
        userId: action.payload.userId,
      };
    case 'logout':
      return {
        logged: false,
        token: null, 
        refreshToken: null,
        role: null,
        email: null,
        userId: null,
      };
    default:
      return state;
  }
};

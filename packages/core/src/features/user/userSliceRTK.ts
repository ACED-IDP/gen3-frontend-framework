import { createSelector } from '@reduxjs/toolkit';
import { coreCreateApi } from '../../api';
import { fetchFence, Gen3FenceResponse } from '../fence/fenceApi';
import { Gen3User, LoginStatus } from './types';
import { CoreState } from '../../reducers';
import { getCookie } from 'cookies-next';

interface StatusWithCSRFTokenResponse {
  csrf: string;
  message?: string;
}

export interface CSRFToken {
  readonly csrfToken: string;
}

export interface UserAuthResponse {
  readonly data: Gen3User;
  readonly loginStatus: LoginStatus;
}

const userAuthApi = coreCreateApi({
  reducerPath: 'userAuthApi',
  refetchOnFocus: true,
  refetchOnMountOrArgChange: 1800,
  refetchOnReconnect: true,
  baseQuery: async ({ endpoint }, { getState }) => {
    let results;
    const csrfToken = selectCSRFToken(getState() as CoreState);
    let accessToken = undefined;
    if (process.env.NODE_ENV === 'development') {
      accessToken = getCookie('credentials_token');
      console.log("accessToken: ", accessToken);
    }
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      credentials: 'include',
    };

    console.log("fetching user details");
    try {
      results = await fetchFence({ endpoint, headers });
    } catch (e) {
      /*
        Because an "error" response is valid for the auth requests we don't want to
        put the request in an error state, or it will attempt the request over and over again
      */
      return { data: {} };
    }

    return { data: results };
  },
  endpoints: (builder) => ({
    fetchUserDetails: builder.query<UserAuthResponse, void>({
      query: () => ({ endpoint: '/user/user' }),
      transformResponse(response: Gen3FenceResponse<Gen3User>) {
        console.log("userSliceRTK: response: ", response);
        return {
          data: response.data,
          // TODO: check if this is the correct status code

          loginStatus:
            response.status === 200 && response.data?.username
              ? 'authenticated'
              : 'unauthenticated',
        };
      },
    }),
    getCSRF: builder.query<CSRFToken, void>({
      query: () => ({ endpoint: '/_status' }),
      transformResponse: (
        response: Gen3FenceResponse<StatusWithCSRFTokenResponse>,
      ): CSRFToken => {
        return { csrfToken: response?.data?.csrf ?? '' };
      },
    }),
  }),
});

const EMPTY_USER: Gen3User = {
  username: undefined,
};

export const {
  useFetchUserDetailsQuery,
  useLazyFetchUserDetailsQuery,
  useGetCSRFQuery,
} = userAuthApi;
export const userAuthApiMiddleware = userAuthApi.middleware;
export const userAuthApiReducerPath = userAuthApi.reducerPath;
export const userAuthApiReducer = userAuthApi.reducer;

export const selectUserDetailsFromState =
  userAuthApi.endpoints.fetchUserDetails.select();

export const selectUserDetails = createSelector(
  selectUserDetailsFromState,
  (userDetails) => userDetails?.data?.data ?? EMPTY_USER,
);

export const selectUserAuthStatus = createSelector(
  selectUserDetailsFromState,
  (userLoginState) =>
    userLoginState?.data?.loginStatus ?? ('unauthenticated' as LoginStatus),
);

export const selectCSRFTokenData = userAuthApi.endpoints.getCSRF.select();

const passThroughTheState = (state: CoreState) => state.gen3Services;

export const selectCSRFToken = createSelector(
  [selectCSRFTokenData, passThroughTheState],
  (state) => state?.data?.csrfToken,
);

export const selectHeadersWithCSRFToken = createSelector(
  [selectCSRFToken, passThroughTheState],
  (csrfToken) => ({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
  }),
);

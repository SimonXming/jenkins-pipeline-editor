import { capabilityAugmenter, loadingIndicator, Utils } from '@jenkins-cd/blueocean-core-js';
import isoFetch from 'isomorphic-fetch';
import dedupe from '../utils/dedupe-calls'

export const JenkinUrl = "http://127.0.0.1:8888"
export const JenkinBlueUrl = JenkinUrl + "/blue"

let refreshToken = null;

const FetchFunctions = {
    /**
     * This method checks for for 2XX http codes. Throws error it it is not.
     * This should only be used if not using fetch or fetchJson.
     */
    checkStatus(response) {
        if (response.status >= 300 || response.status < 200) {
            const error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
        return response;
    },

    /**
     * Adds same-origin option to the fetch.
     */
    sameOriginFetchOption(options = {}) {
        const newOpts = Utils.clone(options);
        newOpts.credentials = newOpts.credentials || 'same-origin';
        return newOpts;
    },

    /**
     * Enhances the fetchOptions with the JWT bearer token. Will only be needed
     * if not using fetch or fetchJson.
     */
    jwtFetchOption(token, options = {}) {
        const newOpts = Utils.clone(options);
        newOpts.headers = newOpts.headers || {};
        newOpts.headers.Authorization = newOpts.headers.Authorization || `Bearer ${token}`;
        return newOpts;
    },

    /**
     * REturns the json body from the response. It is only needed if
     * you are using FetchUtils.fetch
     *
     * Usage:
     * FetchUtils.fetch(..).then(FetchUtils.parseJSON)
     */
    parseJSON(response) {
        return response.json()
        // FIXME: workaround for status=200 w/ empty response body that causes error in Chrome
        // server should probably return HTTP 204 instead
        .catch((error) => {
            if (error.message === 'Unexpected end of JSON input') {
                return {};
            }
            throw error;
        });
    },

    /* eslint-disable no-param-reassign */
    /**
     * Parses the response body for the error generated in checkStatus.
     */
    parseErrorJson(error) {
        return error.response.json().then(
            body => {
                error.responseBody = body;
                throw error;
            },
            () => {
                error.responseBody = null;
                throw error;
            });
    },
    /* eslint-enable no-param-reassign */

     /**
     * Error function helper to log errors to console.
     *
     * Usage;
     * fetchJson(..).catch(FetchUtils.consoleError)
     */
    consoleError(error) {
        console.error(error); // eslint-disable-line no-console
    },

    /**
     * Error function helper to call a callback on a rejected promise.
     * if callback is null, log to console). Use .catch() if you know it
     * will not be null though.
     *
     * Usage;
     * fetchJson(..).catch(FetchUtils.onError(error => //do something)
     */
    onError(errorFunc) {
        return error => {
            if (errorFunc) {
                errorFunc(error);
            } else {
                FetchFunctions.consoleError(error);
            }
        };
    },

     /**
     * Raw fetch that returns the json body.
     *
     * This method is semi-private, under normal conditions it should not be
     * used as it does not include the JWT bearer token
     *
     * @param {string} url - The URL to fetch from.
     * @param {Object} [options]
     * @param {function} [options.onSuccess] - Optional callback success function.
     * @param {function} [options.onError] - Optional error callback.
     * @param {Object} [options.fetchOptions] - Optional isomorphic-fetch options.
     * @param {boolean} [options.disableDedupe] - Optional flag to disable dedupe for this request.
     * @returns JSON body
     */
    rawFetchJSON(url, {onSuccess, onError, fetchOptions, disableDedupe} = {}) {
        const request = () => {
            let future

            future = isoFetch(url, FetchFunctions.sameOriginFetchOption(fetchOptions))
                .then(FetchFunctions.checkStatus)
                .then(FetchFunctions.parseJSON, FetchFunctions.parseErrorJson);

            if (onSuccess) {
                return future.then(onSuccess).catch(FetchFunctions.onError(onError));
            }

            return future;
        };
        if (disableDedupe) {
            return request();
        }

        return dedupe(url, request);
    },
    /**
     * Raw fetch.
     *
     * This method is semi-private, under normal conditions it should not be
     * used as it does not include the JWT bearer token
     *
     * @param {string} url - The URL to fetch from.
     * @param {Object} [options]
     * @param {function} [options.onSuccess] - Optional callback success function.
     * @param {function} [options.onError] - Optional error callback.
     * @param {Object} [options.fetchOptions] - Optional isomorphic-fetch options.
     * @returns fetch response
     */
    rawFetch(url, {onSuccess, onError, fetchOptions, disableDedupe} = {}) {
        const request = () => {
            let future
            future = isoFetch(url, FetchFunctions.sameOriginFetchOption(fetchOptions))
                .then(FetchFunctions.checkRefreshHeader)
                .then(FetchFunctions.checkStatus);

            if (onSuccess) {
                return future.then(onSuccess).catch(FetchFunctions.onError(onError));
            }
            return future;
        };

        if (disableDedupe) {
            return request();
        }

        return dedupe(url, request);
    },
};

export const Fetch = {
    /**
     * Fetch JSON data.
     * <p>
     * Utility function that can be mocked for testing.
     *
     * @param {string} url - The URL to fetch from.
     * @param {Object} [options]
     * @param {function} [options.onSuccess] - Optional callback success function.
     * @param {function} [options.onError] - Optional error callback.
     * @param {Object} [options.fetchOptions] - Optional isomorphic-fetch options.
     * @returns JSON body.
     */
    fetchJSON(url, {onSuccess, onError, fetchOptions, disableCapabilites} = {}) {
        let fixedUrl = url;
        if (!url.startsWith("http")) {
            fixedUrl = `${JenkinUrl}${url}`;
        }
        let future;
        future = FetchFunctions.rawFetchJSON(fixedUrl, { onSuccess, onError, fetchOptions});

        if (!disableCapabilites) {
            return future.then(data => capabilityAugmenter.augmentCapabilities(Utils.clone(data)));
        }

        return future;
    },
    /**
     * Fetch data.
     * <p>
     * Utility function that can be mocked for testing.
     *
     * @param {string} url - The URL to fetch from.
     * @param {Object} [options]
     * @param {function} [options.onSuccess] - Optional callback success function.
     * @param {function} [options.onError] - Optional error callback.
     * @param {Object} [options.fetchOptions] - Optional isomorphic-fetch options.
     * @returns fetch body.
     */
    fetch(url, {onSuccess, onError, fetchOptions} = {}) {
        let fixedUrl = url;

        if (!url.startsWith(JenkinUrl)) {
            fixedUrl = `${JenkinUrl}${url}`;
        }
        return FetchFunctions.rawFetch(fixedUrl, { onSuccess, onError, fetchOptions});
    },

};

function trimRestUrl(url) {
    const REST_PREFIX = 'blue/rest/';
    const prefixOffset = url.indexOf(REST_PREFIX);

    if (prefixOffset !== -1) {
        return url.substring(prefixOffset);
    }

    return url;
}
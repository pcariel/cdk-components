const authenticateMock = jest.fn();
const createMock = jest.fn();
const updateMock = jest.fn();
const deleteMock = jest.fn();

/* eslint-disable-next-line */
jest.mock('@octokit/rest', () =>
    jest.fn().mockImplementation(() => ({
        authenticate: authenticateMock,
        repos: {
            createHook: createMock,
            updateHook: updateMock,
            deleteHook: deleteMock,
        },
    })),
);

/* eslint-disable */
import { createWebhook, updateWebhook, deleteWebhook } from '../webhook-api';
import { Response, ReposCreateHookResponse } from '@octokit/rest';
/* eslint-enable */

describe('cdk-github-webhook-lambda: webhook-api', (): void => {
    it('should call createHook with correct params', (): void => {
        const githubApiToken = 'secure';
        const githubRepoUrl =
            'https://github.com/cloudcomponents/cdk-components';
        const payloadUrl = 'payloadUrl';
        const events = ['*'];

        createWebhook(githubApiToken, githubRepoUrl, payloadUrl, events);

        expect(authenticateMock).toHaveBeenCalled();
        expect(authenticateMock).toHaveBeenCalledWith({
            token: 'secure',
            type: 'token',
        });

        expect(createMock).toHaveBeenCalled();
        expect(createMock).toHaveBeenCalledWith({
            name: 'web',
            owner: 'cloudcomponents',
            repo: 'cdk-components',
            config: { url: payloadUrl, content_type: 'json' },
            events,
            active: true,
        });
    });

    it('should call updateHook with correct params', (): void => {
        const githubApiToken = 'secure';
        const githubRepoUrl =
            'https://github.com/cloudcomponents/cdk-components';
        const payloadUrl = 'payloadUrl';
        const events = ['*'];
        const hookId = 12;

        updateWebhook(
            githubApiToken,
            githubRepoUrl,
            payloadUrl,
            events,
            hookId,
        );

        expect(authenticateMock).toHaveBeenCalled();
        expect(authenticateMock).toHaveBeenCalledWith({
            token: 'secure',
            type: 'token',
        });

        expect(updateMock).toHaveBeenCalled();
        expect(updateMock).toHaveBeenCalledWith({
            owner: 'cloudcomponents',
            repo: 'cdk-components',
            config: { url: payloadUrl, content_type: 'json' },
            events,
            active: true,
            hook_id: hookId,
        });
    });

    it('should call deleteHook with correct params', (): void => {
        const githubApiToken = 'secure';
        const githubRepoUrl =
            'https://github.com/cloudcomponents/cdk-components';
        const hookId = 12;

        deleteWebhook(githubApiToken, githubRepoUrl, hookId);

        expect(authenticateMock).toHaveBeenCalled();
        expect(authenticateMock).toHaveBeenCalledWith({
            token: 'secure',
            type: 'token',
        });

        expect(deleteMock).toHaveBeenCalled();
        expect(deleteMock).toHaveBeenCalledWith({
            owner: 'cloudcomponents',
            repo: 'cdk-components',
            hook_id: hookId,
        });
    });

    it('should throw an exception if the githubUrl is not correct', (): void => {
        const githubApiToken = 'secure';
        const githubRepoUrl = '*INCORRECT_URL*';
        const payloadUrl = 'payloadUrl';
        const events = ['*'];

        const call = (): Promise<Response<ReposCreateHookResponse>> =>
            createWebhook(githubApiToken, githubRepoUrl, payloadUrl, events);

        expect(call).toThrow('GithubRepoUrl is not correct');
    });
});

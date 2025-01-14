import * as express from 'express';
import { createServer, proxy } from 'aws-serverless-express';
import { APIGatewayEvent, Context } from 'aws-lambda';
import { createMessageAdapter } from '@slack/interactive-messages';

import { Server } from 'http';
import { handleButtonClicked, handleDialog } from './interactions';

const { SLACK_SIGNING_SECRET } = process.env;

const app = express();

const slackInteractions = createMessageAdapter(SLACK_SIGNING_SECRET);

app.use('/slack/actions', slackInteractions.expressMiddleware());

slackInteractions.action('slack_approval', handleButtonClicked);

slackInteractions.action(/(\w+)_dialog/, handleDialog);

const server = createServer(app);

export const handler = (event: APIGatewayEvent, context: Context): Server =>
    proxy(server, event, context);

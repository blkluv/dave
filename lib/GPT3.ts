import { Message, Util } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import Filter from 'bad-words';

import { config } from './Config.js';
import { BannedWords } from './BannedWords.js';

const badWordFilter = new Filter();
badWordFilter.addWords(...BannedWords);

const configuration = new Configuration({
    apiKey: config.openaiApiKey,
});

const openai = new OpenAIApi(configuration);

const DEFAULT_TEMPERATURE = 0.9;
const DEFAULT_MAX_TOKENS = 250;
const DEFAULT_AI_MODEL = 'text-davinci-002';
const DEFAULT_TIMEOUT = 1000 * 30;

export async function handleGPT3(msg: Message, args: string): Promise<void> {
    const bannedUsers = [
        '663270358161293343',
    ];

    if (bannedUsers.includes(msg.author.id)) {
        await msg.reply(`Sorry, this function has been disabled for your user.`);
        return;
    }

    const prompt = args.trim();

    if (prompt.length === 0) {
        await msg.reply(`No prompt given. Try \`${config.prefix}ai help\``);
        return;
    }

    const tempRegex = /(^[\d.]+)?(.*)/s;

    const results = tempRegex.exec(prompt);

    if (!results) {
        await msg.reply(`No prompt given. Try \`${config.prefix}ai help\``);
        return;
    }

    /* Extract temp if present */
    const [ , temp, query ] = results;

    const { result, error } = await handleGPT3Request(
        query,
        undefined,
        undefined,
        Number(temp) || undefined,
        msg.author.id,
    );

    if (result) {
        /* Ensure we don't hit discord api limits */
        const stripped = Util.escapeMarkdown(result.substr(0, 1900));

        await msg.reply(stripped);
    } else {
        await msg.reply(error);
    }
}

export async function handleGPT3Request(
    prompt: string,
    model: string = DEFAULT_AI_MODEL,
    maxTokens: number = DEFAULT_MAX_TOKENS,
    temperature: number = DEFAULT_TEMPERATURE,
    user: string = '',
) {
    if (badWordFilter.isProfane(prompt)) {
        return {
            result: undefined,
            error: `Banned search term. Please try a different prompt to avoid the bot breaking the OpenAI terms of service.`,
        };
    }

    try {
        const completion = await openai.createCompletion({
            model,
            prompt,
            max_tokens: maxTokens,
            temperature,
            echo: true,
            user,
        }, {
            timeout: DEFAULT_TIMEOUT,
        });

        if (completion.data.choices && completion.data.choices.length > 0) {
            return {
                result: completion.data.choices[0].text!,
                error: undefined,
            };
        }
    } catch (err) {
        return {
            result: undefined,
            error: err.toString(),
        };
    }
    
    return {
        result: undefined,
        error: 'Failed to get response from API',
    };
}
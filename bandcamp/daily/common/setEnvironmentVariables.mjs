// setEnvironmentVariables.mjs

import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const client = new SSMClient({ region: "us-east-1" });

const parseEnvironmentVariables = (envString) => {
    const keyValuePairs = envString.split(',');
    const envObject = {};

    keyValuePairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
            envObject[key.trim()] = value.trim();
        }
    });

    return envObject;
}

const setEnvironmentVariables = async () => {
    const params =
    {
        Name: `parameters-${process.env.STAGE}`,
        WithDecryption: true
    };
    const command = new GetParameterCommand(params);
    try {
        const data = await client.send(command);
        const parsedData = parseEnvironmentVariables(data.Parameter.Value);
        process.env = { ...process.env, ...parsedData };
    } catch (error) {
        console.log(error);
    }
}
export { setEnvironmentVariables };

export default async function handler(req, res) {

    const streamers = [
        "dona",
        "jeereemy__",
        "snopey",
        "kosky"
    ];

    try {

        // Pega token da Twitch
        const tokenResponse = await fetch(
            "https://id.twitch.tv/oauth2/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body:
                `client_id=${process.env.TWITCH_CLIENT_ID}` +
                `&client_secret=${process.env.TWITCH_CLIENT_SECRET}` +
                `&grant_type=client_credentials`
            }
        );

        const tokenData = await tokenResponse.json();


        // Consulta lives
        const liveResponse = await fetch(
            "https://api.twitch.tv/helix/streams?user_login=" +
            streamers.join("&user_login="),
            {
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                    "Authorization": `Bearer ${tokenData.access_token}`
                }
            }
        );


        const liveData = await liveResponse.json();


        const resultado = {};

        streamers.forEach(nome => {

            resultado[nome] = false;

        });


        liveData.data.forEach(live => {

            resultado[live.user_login] = true;

        });


        res.status(200).json(resultado);


    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao consultar Twitch"
        });

    }

}
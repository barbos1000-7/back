import express from 'express';
import Stream from 'node-rtsp-stream';

const app = express();


const PORT = 3000;

let data = [
    {
        id: 1,
        title: "admin01",
        description: "Vfrcvfrc123!45!",
        minutes: -1
    },
];

let actualPort = 1000

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.options('/', (req, res) => {
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.json(data);
});
let stream

app.get('/stream/:ID', (req, res) => {
    stream = new Stream({
        name: 'rtmp_server_name',
        streamUrl: 'rtmp://rtmp.inplayip.tv/inplay_rtmp/' + req.params.ID,
        wsPort: actualPort + 1,
        ffmpegOptions: { // options ffmpeg flags
            "-f": "mpegts", // output file format.
            "-codec:v": "mpeg1video", // video codec
            "-b:v": "1000k", // video bit rate
            "-stats": "",
            "-r": 25, // frame rate
            "-s": "640x480", // video size
            "-bf": 0,
            // audio
            "-codec:a": "mp2", // audio codec
            "-ar": 44100, // sampling rate (in Hz)(in Hz)
            "-ac": 1, // number of audio channels
            "-b:a": "128k", // audio bit rate
        },
    });
    if (actualPort < 9999) {
        if (actualPort === 2999) {
            actualPort += 2
        } else if (actualPort === 5172) {
            actualPort += 2
        } else {
            actualPort++
        }
    } else actualPort = 1000
    stream.on('data', data => {
        console.log(data);
    });
    res.json({port: actualPort});


});


app.get('/port/:ID', (req, res) => {
    stream.stop()
    res.json({message: 'success'});
});


app.get('/minutesDecrement/:ID', (req, res) => {
    if(req.params.ID == 1) {
        res.json({status: 'ok'})
    }
    else {
        data = data.map(user => {
            if (user.id == req.params.ID) {
                if((user.minutes - 1) === 0) {
                    res.json({status: 'minutes null'});
                    return
                }
                return {...user, minutes: user.minutes - 1}
            } else return user
        })
        res.json({status: 'ok'});
    }

});
app.get('/minutes/:ID', (req, res) => {

    let user = data.find(user => {
        console.log(user.id, req.params.ID)
        return user.id == req.params.ID
    })
    console.log(user.minutes)

    res.json({minutes: user.minutes});
});

app.post('/', (req, res) => {
    const {title, description, minutes} = req.body;
    const id = data.length > 0 ? data[data.length - 1].id + 1 : 1;
    data.push({id, title, description, minutes});
    res.json(data);
});

app.delete('/', (req, res) => {
    const {id} = req.query;
    data = data.filter(item => item.id !== parseInt(id));
    res.json(data);
});

app.put('/', (req, res) => {
    const {id, title, description} = req.body;
    data = data.map(item => (item.id === parseInt(id) ? {id, title, description} : item));
    res.json(data);
});

app.listen(PORT, () => {
    console.log('Сервер запущен');
});

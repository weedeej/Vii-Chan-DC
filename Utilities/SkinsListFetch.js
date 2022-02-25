import axios from 'axios';
import { Logger } from './Logger.js';

export async function ObtainSkinlist() {
    const resp = await axios.get('https://vtools-next.vercel.app/api/skinslist').catch(err => {
        Logger.error(err);
        return null;
    });
    return resp.data;
}
export default async function wait(ms)
{
    return new Promise(resolve => 
        setTimeout(() => 
            resolve(true), ms))
} 

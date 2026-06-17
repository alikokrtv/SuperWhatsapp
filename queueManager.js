const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const logger = require('./logger');

const JOBS_FILE = path.join(__dirname, 'jobs.json');

// Ensure the file exists
if (!fs.existsSync(JOBS_FILE)) {
    fs.writeFileSync(JOBS_FILE, JSON.stringify([]));
}

function getJobs() {
    try {
        const data = fs.readFileSync(JOBS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        logger.error("Error reading jobs.json", e);
        return [];
    }
}

function saveJobs(jobs) {
    try {
        fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    } catch (e) {
        logger.error("Error writing jobs.json", e);
    }
}

function addJob(chatId, message, scheduledTime, mediaObj = null) {
    const jobs = getJobs();
    const newJob = {
        id: Date.now().toString() + Math.floor(Math.random() * 1000),
        chatId,
        message,
        scheduledTime,
        media: mediaObj, // Store as base64 string/mimetype if needed
        status: 'pending'
    };
    jobs.push(newJob);
    saveJobs(jobs);
    return newJob.id;
}

function startQueue(client, io) {
    logger.info("[Queue Manager] Başlatıldı. Bekleyen işler kontrol ediliyor...");
    
    setInterval(async () => {
        const jobs = getJobs();
        const now = new Date().getTime();
        let modified = false;
        
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const jobTime = new Date(job.scheduledTime).getTime();
            
            if (job.status === 'pending' && now >= jobTime) {
                // Zamanı gelmiş veya geçmiş (bilgisayar uyuduğu için kaçırılmış) mesaj
                try {
                    logger.info(`[Queue Manager] İşleniyor: ${job.id} -> ${job.chatId}`);
                    
                    if (job.media) {
                        const base64Data = job.media.data.split(',')[1];
                        const mediaContent = new MessageMedia(job.media.mimetype, base64Data, job.media.filename);
                        await client.sendMessage(job.chatId, job.message, { media: mediaContent });
                    } else {
                        await client.sendMessage(job.chatId, job.message);
                    }
                    
                    job.status = 'completed';
                    modified = true;
                    if(io) io.emit('log', `Zamanlanmış mesaj gönderildi: ${job.chatId}`);
                } catch (e) {
                    logger.error(`[Queue Manager] Gönderim hatası (Job ID: ${job.id}):`, e);
                    // Hata durumunda 1 dakika sonra tekrar dene
                    job.scheduledTime = new Date(now + 60000).toISOString();
                    modified = true;
                }
            }
        }
        
        if (modified) {
            // Tamamlanan işleri temizle ve kaydet
            const activeJobs = jobs.filter(j => j.status !== 'completed');
            saveJobs(activeJobs);
        }
        
    }, 10000); // Her 10 saniyede bir kontrol et
}

module.exports = {
    addJob,
    startQueue
};

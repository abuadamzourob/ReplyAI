export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'المسار غير مدعوم' });
    }

    const { platform, text } = req.body;
    const currentKey = process.env.GEMINI_API_KEY;

    if (!currentKey) {
        return res.status(500).json({ error: 'خطأ: لم يتم ضبط المفتاح في إعدادات Environment Variables على Vercel.' });
    }

    let platformContext = "";
    if (platform === 'whatsapp') {
        platformContext = "أنت الآن تعمل كبوت ذكي مدمج داخل تطبيق الواتساب (WhatsApp). أجب باختصار ووضوح شديد وبلطف.";
    } else if (platform === 'messenger') {
        platformContext = "أنت الآن تعمل كبوت ذكي مدمج داخل فيسبوك ماسنجر (Facebook Messenger) لصفحة تجارية. أجب باحترافية.";
    } else if (platform === 'instagram') {
        platformContext = "أنت الآن تعمل كبوت ذكي مدمج داخل حساب إنستغرام (Instagram). أجب بطريقة عصرية وتفاعلية مع إيموجي.";
    }

    const promptText = `${platformContext}\n\nسؤال المستخدم الحالي هو: "${text}"`;

    try {
        // استخدام الإصدار المستقر v1 مع مسار models الصحيح والمضمون
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${currentKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        
        // فحص إذا كان الرد ليس JSON لمنع انهيار الموقع
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const rawText = await response.text();
            throw new Error(`رد غير متوقع من جوجل: ${rawText.substring(0, 100)}`);
        }

        const d = await response.json();
        if (d.error) throw new Error(d.error.message);
        
        return res.status(200).json({ reply: d.candidates[0].content.parts[0].text });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي' });
    }
}


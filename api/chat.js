export default async function handler(req, res) {
    // استقبال الطلبات من نوع POST فقط لحماية السيرفر
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'المسار غير مدعوم' });
    }

    const { platform, text } = req.body;
    // قراءة المفتاح بأمان تام داخل السيرفر بدون ما يظهر للمتصفح
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
        // السيرفر هو من يتحدث مع جوجل بالخفاء
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        
        const d = await response.json();
        if (d.error) throw new Error(d.error.message);
        
        // إرسال الرد الجاهز فقط للمتصفح
        return res.status(200).json({ reply: d.candidates[0].content.parts[0].text });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي' });
    }
}

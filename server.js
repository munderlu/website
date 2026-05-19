const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.SITE_PASSWORD || "geheim123";

app.use(express.json());

// Statische Dateien für das öffentliche Frontend bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

// API-Route für den Passwort-Check
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    
    if (password === PASSWORD) {
        return res.json({
            success: true,
            // Das geschützte HTML wird erst nach erfolgreichem Login an den Client geschickt
            html: `
                <div style="margin-top: 25px; padding: 20px; background: #ffffff; border-radius: 8px; border-top: 4px solid var(--meadow); text-align: left; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <h3 style="color: var(--thunder-cloud); margin-bottom: 10px;">🔒 Geschützter Bereich freigeschaltet</h3>
                    <p style="margin-bottom: 20px; color: var(--text-dark);">Hier finden Sie meine vollständigen Zeugnisse, Referenzen und Kontaktdaten.</p>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                        <a href="/api/download?file=lebenslauf_detailliert.txt&password=${encodeURIComponent(password)}" class="btn" style="background-color: var(--meadow); color: white; display: inline-block;">
                            📄 Ausführlichen Lebenslauf laden
                        </a>
                    </div>
                </div>
            `
        });
    } else {
        return res.status(401).json({ 
            success: false, 
            message: "Falsches Passwort! Bitte versuchen Sie es erneut." 
        });
    }
});

// Sichere Download-Route für Dokumente (Dateien liegen außerhalb des 'public' Ordners)
app.get('/api/download', (req, res) => {
    const { file, password } = req.query;

    if (password !== PASSWORD) {
        return res.status(403).send("Zugriff verweigert: Ungültiges Passwort.");
    }

    // Schutz vor Directory Traversal (Verhindert das Auslesen anderer Systemdateien)
    const safeFileName = path.basename(file);
    const filePath = path.join(__dirname, 'private_docs', safeFileName);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send("Datei nicht gefunden oder nicht mehr verfügbar.");
    }
});

app.listen(PORT, () => {
    console.log(`Server läuft erfolgreich auf Port ${PORT}`);
});

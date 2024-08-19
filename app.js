async function hentBrukere() {
    const response = await fetch('https://node-red.cloudflareno.de/api/brukere'); // Juster URL om nødvendig
    const brukere = await response.json();
    oppdaterBrukerListe(brukere);
}

function oppdaterBrukerListe(brukere) {
    const brukerListe = document.getElementById('brukerListe');
    brukerListe.innerHTML = ''; // Rens tabellen

    brukere.forEach(bruker => {
        const row = document.createElement('tr');
        row.classList.add(bruker.status.toLowerCase());

        row.innerHTML = `
            <td>${bruker.navn}</td>
            <td>${bruker.status}</td>
            <td>${bruker.ansatt || 'Ingen'}</td>
            <td class="actions">
                <button onclick="taBruker(${bruker.id})">Ta Bruker</button>
                <button onclick="frigjorBruker(${bruker.id})">Frigjør Bruker</button>
            </td>
        `;

        brukerListe.appendChild(row);
    });
}

async function taBruker(brukerId) {
    const ansatt = prompt('Vennligst skriv inn ditt navn:');
    if (ansatt) {
        await fetch('https://node-red.cloudflareno.de/api/oppdater', { // Juster URL om nødvendig
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                brukerId: brukerId,
                ansatt: ansatt,
                aksjon: 'ta'
            })
        });
        hentBrukere();
    }
}

async function frigjorBruker(brukerId) {
    await fetch('https://node-red.cloudflareno.de/api/oppdater', { // Juster URL om nødvendig
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            brukerId: brukerId,
            aksjon: 'frigjør'
        })
    });
    hentBrukere();
}

// Initialiser ved å hente brukere når siden lastes
hentBrukere();

const BASE_URL = 'https://node-red.cloudflareno.de/api';

// Hent brukere fra backend og oppdater tabellen
async function hentBrukere() {
    try {
        const response = await fetch(`${BASE_URL}/brukere`);
        if (!response.ok) throw new Error(`HTTP-feil! Status: ${response.status}`);
        const brukere = await response.json();
        oppdaterBrukerListe(brukere);
    } catch (error) {
        console.error('Feil ved henting av brukere:', error);
        alert('Kunne ikke hente brukere.');
    }
}

// Oppdater tabellen med brukere
function oppdaterBrukerListe(brukere) {
    const brukerListe = document.getElementById('brukerListe');
    brukerListe.innerHTML = ''; // Rens tabellen

    const fragment = document.createDocumentFragment(); // For å forbedre ytelsen

    brukere.forEach(bruker => {
        const row = document.createElement('tr');
        row.classList.add(bruker.status.toLowerCase());
        row.dataset.brukerId = bruker.id; // Legg til brukerID i dataset

        // Endre HTML-innholdet for å ikke vise 'Ingen' når det ikke er noen ansatt
        row.innerHTML = `
            <td>${bruker.navn}</td>
            <td>${bruker.status}</td>
            <td>${bruker.ansatt || ''}</td>
            <td class="actions">
                <button onclick="håndterBruker(${bruker.id})">
                    ${bruker.status === 'Ledig' ? 'Ta Bruker' : 'Frigjør Bruker'}
                </button>
            </td>
        `;

        fragment.appendChild(row);
    });

    brukerListe.appendChild(fragment);
}

// Finn den første ledige brukeren i listen
function finnForsteLedigeBruker(brukere) {
    return brukere.find(bruker => bruker.status === 'Ledig');
}

// Håndter bruker basert på status
async function håndterBruker(brukerId) {
    try {
        // Hent alle brukere
        const response = await fetch(`${BASE_URL}/brukere`);
        if (!response.ok) throw new Error(`HTTP-feil! Status: ${response.status}`);
        const brukere = await response.json();

        // Hent rad for den valgte brukeren
        const row = document.querySelector(`tr[data-bruker-id="${brukerId}"]`);
        if (!row) {
@@ -76,8 +20,8 @@ async function håndterBruker(brukerId) {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        brukerId: brukerId,
                        ansatt: ansatt,
                        brukerId,
                        ansatt,
                        aksjon: 'ta'
                    })
                });
@@ -99,7 +43,7 @@ async function håndterBruker(brukerId) {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        brukerId: brukerId,
                        brukerId,
                        aksjon: 'frigjør'
                    })
                });
@@ -118,16 +62,3 @@ async function håndterBruker(brukerId) {
        alert('Noe gikk galt med forespørselen.');
    }
}

// Hent ansatt-navn fra tabellen basert på bruker-ID
function hentAnsattNavn(brukerId) {
    const row = document.querySelector(`tr[data-bruker-id="${brukerId}"]`);
    const ansattCell = row ? row.cells[2] : null;
    return ansattCell ? ansattCell.textContent.trim() : '';
}

// Initialiser ved å hente brukere når siden lastes
hentBrukere();

// Oppdater tabellen automatisk hvert 10. sekund
setInterval(hentBrukere, 10000);

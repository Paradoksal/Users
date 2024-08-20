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

        row.innerHTML = `
            <td>${bruker.navn}</td>
            <td>${bruker.status}</td>
            <td>${bruker.ansatt || 'Ingen'}</td>
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
            alert('Brukeren finnes ikke.');
            return;
        }

        // Hent status på den valgte brukeren
        const statusCell = row.cells[1]; // Forutsatt at statusen er i den andre cellen
        const brukerStatus = statusCell.textContent.trim();

        if (brukerStatus === 'Ledig') {
            const ansatt = prompt('Vennligst skriv inn ditt navn:');
            if (ansatt) {
                const updateResponse = await fetch(`${BASE_URL}/oppdater`, {
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

                if (updateResponse.ok) {
                    hentBrukere();
                } else {
                    alert('Noe gikk galt med å ta brukeren.');
                }
            }
        } else if (brukerStatus === 'Opptatt') {
            const ansattNavn = hentAnsattNavn(brukerId);
            const bekreftelse = confirm(`Er du sikker på at du vil frigjøre ${ansattNavn}? Husk at du ikke må frigjøre brukere som benyttes av andre.`);

            if (bekreftelse) {
                const updateResponse = await fetch(`${BASE_URL}/oppdater`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        brukerId: brukerId,
                        aksjon: 'frigjør'
                    })
                });

                if (updateResponse.ok) {
                    hentBrukere();
                } else {
                    alert('Noe gikk galt med å frigjøre brukeren.');
                }
            }
        } else {
            alert('Ukjent status.');
        }
    } catch (error) {
        console.error('Feil ved oppdatering:', error);
        alert('Noe gikk galt med forespørselen.');
    }
}

// Hent ansatt-navn fra tabellen basert på bruker-ID
function hentAnsattNavn(brukerId) {
    const row = document.querySelector(`tr[data-bruker-id="${brukerId}"]`);
    const ansattCell = row ? row.cells[2] : null;
    return ansattCell ? ansattCell.textContent : 'Ingen';
}

// Initialiser ved å hente brukere når siden lastes
hentBrukere();

// Oppdater tabellen automatisk hvert 10. sekund
setInterval(hentBrukere, 10000);

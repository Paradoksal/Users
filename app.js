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
        row.dataset.brukerId = bruker.id; // Legg til brukerID i dataset

        row.innerHTML = `
            <td>${bruker.navn}</td>
            <td class="ansatt-d">${bruker.ansattD || ''}</td>
            <td class="actions">
                <button onclick="håndterBruker(${bruker.id}, 'desktop')">
                    ${bruker.ansattD ? 'Frigjør Bruker' : 'Ta Bruker'}
                </button>
            </td>
            <td class="ansatt-s">${bruker.ansattS || ''}</td>
            <td class="actions">
                <button onclick="håndterBruker(${bruker.id}, 'skannemodul')">
                    ${bruker.ansattS ? 'Frigjør Bruker' : 'Ta Bruker'}
                </button>
            </td>
        `;

        // Oppdater celler med klassen 'opptatt' hvis ansattD eller ansattS er fylt ut
        if (bruker.ansattD) {
            row.cells[1].classList.add('opptatt');
            row.cells[2].classList.add('opptatt');
        }
        if (bruker.ansattS) {
            row.cells[3].classList.add('opptatt');
            row.cells[4].classList.add('opptatt');
        }

        fragment.appendChild(row);
    });

    brukerListe.appendChild(fragment);
}

// Finn den første ledige brukeren for en gitt type
function finnFørsteLedigeBruker(brukere, type) {
    return brukere.find(bruker => {
        return (type === 'desktop' && !bruker.ansattD) || 
               (type === 'skannemodul' && !bruker.ansattS);
    });
}

// Håndter bruker basert på status og type
async function håndterBruker(brukerId, type) {
    try {
        const response = await fetch(`${BASE_URL}/brukere`);
        if (!response.ok) throw new Error(`HTTP-feil! Status: ${response.status}`);
        const brukere = await response.json();

        const førsteLedigeBruker = finnFørsteLedigeBruker(brukere, type);

        if (førsteLedigeBruker && førsteLedigeBruker.id !== brukerId) {
            alert(`Du må ta den første ledige ${type === 'desktop' ? 'Desktop' : 'Skannemodul'} brukeren.`);
            return;
        }

        const row = document.querySelector(`tr[data-bruker-id="${brukerId}"]`);
        if (!row) {
            alert('Brukeren finnes ikke.');
            return;
        }

        const ansattCell = type === 'desktop' ? row.cells[1] : row.cells[3];
        const statusCell = type === 'desktop' ? row.cells[2] : row.cells[4];
        const ansattNavn = ansattCell.textContent.trim();

        if (!ansattNavn) {
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
                        aksjon: type === 'desktop' ? 'taDesktop' : 'taSkannemodul'
                    })
                });

                if (updateResponse.ok) {
                    hentBrukere();
                } else {
                    alert('Noe gikk galt med å ta brukeren.');
                }
            }
        } else {
            const bekreftelse = confirm(`Er du sikker på at du vil frigjøre ${ansattNavn}?`);
            if (bekreftelse) {
                const updateResponse = await fetch(`${BASE_URL}/oppdater`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        brukerId: brukerId,
                        aksjon: type === 'desktop' ? 'frigjørDesktop' : 'frigjørSkannemodul'
                    })
                });

                if (updateResponse.ok) {
                    hentBrukere();
                } else {
                    alert('Noe gikk galt med å frigjøre brukeren.');
                }
            }
        }
    } catch (error) {
        console.error('Feil ved oppdatering:', error);
        alert('Noe gikk galt med forespørselen.');
    }
}

// Initialiser ved å hente brukere når siden lastes
hentBrukere();

// Oppdater tabellen automatisk hvert 10. sekund
setInterval(hentBrukere, 10000);

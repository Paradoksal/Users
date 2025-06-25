const BASE_URL = 'https://node-red.cloudflareno.de/api';

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

function oppdaterBrukerListe(brukere) {
    const brukerListe = document.getElementById('brukerListe');
    brukerListe.innerHTML = '';
    const fragment = document.createDocumentFragment();

    brukere.forEach(bruker => {
        const row = document.createElement('tr');
        row.dataset.brukerId = bruker.id;

        const passord = bruker.passord || '';
        const passordCell = `
            <td>
                <span>${passord}</span>
                ${passord ? `<button class="copy-btn" title="Kopier passord" onclick="kopierPassord('${passord}')">📋</button>` : ''}
            </td>
        `;

        row.innerHTML = 
            `<td>${bruker.navn}</td>
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
            ${passordCell}`;

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

function kopierPassord(passord) {
    navigator.clipboard.writeText(passord)
        .catch(() => alert('Klarte ikke å kopiere passord.'));
}

function finnFørsteLedigeBruker(brukere, type) {
    return brukere.find(bruker => {
        return (type === 'desktop' && !bruker.ansattD) ||
               (type === 'skannemodul' && !bruker.ansattS);
    });
}

async function håndterBruker(brukerId, type) {
    try {
        const response = await fetch(`${BASE_URL}/brukere`);
        if (!response.ok) throw new Error(`HTTP-feil! Status: ${response.status}`);
        const brukere = await response.json();

        const row = document.querySelector(`tr[data-bruker-id="${brukerId}"]`);
        if (!row) return alert('Brukeren finnes ikke.');

        const ansattCell = type === 'desktop' ? row.cells[1] : row.cells[3];
        const ansattNavn = ansattCell.textContent.trim();

        if (!ansattNavn) {
            const førsteLedigeBruker = finnFørsteLedigeBruker(brukere, type);
            const erAdmin = row.cells[0].textContent.trim().includes("Admin");

            if (førsteLedigeBruker && førsteLedigeBruker.id !== brukerId && !erAdmin) {
                alert(`Du må ta den første ledige ${type === 'desktop' ? 'Desktop' : 'Skannemodul'} brukeren.`);
                return;
            }

            const ansatt = prompt('Vennligst skriv inn ditt navn:');
            if (ansatt) {
                const riktigNavn = ansatt.split(' ')
                    .map(ord => ord.charAt(0).toUpperCase() + ord.slice(1))
                    .join(' ');

                const updateResponse = await fetch(`${BASE_URL}/oppdater`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        brukerId: brukerId,
                        ansatt: riktigNavn,
                        aksjon: type === 'desktop' ? 'taDesktop' : 'taSkannemodul'
                    })
                });

                if (updateResponse.ok) hentBrukere();
                else alert('Noe gikk galt med å ta brukeren.');
            }
        } else {
            const bekreft = confirm(`Er du sikker på at du vil frigjøre ${ansattNavn}?`);
            if (bekreft) {
                const updateResponse = await fetch(`${BASE_URL}/oppdater`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        brukerId: brukerId,
                        aksjon: type === 'desktop' ? 'frigjørDesktop' : 'frigjørSkannemodul'
                    })
                });

                if (updateResponse.ok) hentBrukere();
                else alert('Noe gikk galt med å frigjøre brukeren.');
            }
        }
    } catch (error) {
        console.error('Feil ved oppdatering:', error);
        alert('Noe gikk galt med forespørselen.');
    }
}

// Init
hentBrukere();
setInterval(hentBrukere, 10000);

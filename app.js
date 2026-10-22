
const $ = id => document.getElementById(id);

const fields = [
  'company', 'companyDetails',
  'client', 'clientDetails',
  'number', 'date', 'validity',
  'vat', 'notes'
];

let activeId = null;

const money = n => new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
}).format(n);

function readAll() {
  try {
    return JSON.parse(
      localStorage.getItem('autodevis_quotes') || '[]'
    );
  } catch {
    return [];
  }
}

function line(item = {
  description: '',
  quantity: 1,
  price: 0
}) {
  const d = document.createElement('div');
  d.className = 'row';

  d.innerHTML = `
    <label>Description
      <input class="desc" placeholder="Prestation">
    </label>
    <label>Quantité
      <input class="qty" type="number"
        min="0" step="0.01">
    </label>
    <label>Prix HT (€)
      <input class="price" type="number"
        min="0" step="0.01">
    </label>
    <button type="button"
      class="danger no-print">×</button>
  `;

  d.querySelector('.desc').value =
    item.description || '';

  d.querySelector('.qty').value =
    item.quantity ?? 1;

  d.querySelector('.price').value =
    item.price ?? 0;

  d.querySelector('button').onclick = () => {
    d.remove();
    calc();
  };

  d.querySelectorAll('input').forEach(i =>
    i.addEventListener('input', calc)
  );

  $('items').append(d);
  calc();
}

function items() {
  return [...document.querySelectorAll('.row')]
    .map(r => ({
      description: r.querySelector('.desc').value,
      quantity: Number(
        r.querySelector('.qty').value
      ),
      price: Number(
        r.querySelector('.price').value
      )
    }));
}

function calc() {
  const ht = items().reduce(
    (sum, item) =>
      sum + item.quantity * item.price,
    0
  );

  const vat = Number($('vat').value) || 0;
  const tax = ht * vat / 100;

  $('totals').innerHTML =
    'Total HT : ' + money(ht) +
    '<br>TVA (' + vat + ' %) : ' +
    money(tax) +
    '<br><strong>Total TTC : ' +
    money(ht + tax) + '</strong>';
}

function capture() {
  return {
    id: activeId || (
      crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now())
    ),
    ...Object.fromEntries(
      fields.map(f => [f, $(f).value])
    ),
    items: items(),
    updated: new Date().toISOString()
  };
}

function load(q) {
  activeId = q.id;

  fields.forEach(f => {
    $(f).value = q[f] ?? '';
  });

  $('items').innerHTML = '';

  (q.items || []).forEach(line);

  calc();
  window.scrollTo(0, 0);
}

function render() {
  const root = $('saved');
  root.replaceChildren();

  const quotes = readAll().sort(
    (a, b) => b.updated.localeCompare(a.updated)
  );

  for (const q of quotes) {
    const p = document.createElement('p');

    const label = document.createElement('span');
    label.textContent =
      (q.number || 'Sans numéro') +
      ' — ' +
      (q.client || 'Sans client') + ' ';

    const open = document.createElement('button');
    open.textContent = 'Ouvrir';
    open.onclick = () => load(q);

    const del = document.createElement('button');
    del.textContent = 'Supprimer';
    del.className = 'danger';

    del.onclick = () => {
      if (confirm('Supprimer ce devis ?')) {
        const remaining = readAll().filter(
          x => x.id !== q.id
        );

        localStorage.setItem(
          'autodevis_quotes',
          JSON.stringify(remaining)
        );

        render();
      }
    };

    p.append(label, open, del);
    root.append(p);
  }
}

$('add').onclick = () => line();

$('vat').addEventListener('input', calc);

$('save').onclick = () => {
  if (!$('client').value.trim()) {
    alert('Saisissez un client.');
    return;
  }

  const q = capture();
  const all = readAll();

  const idx = all.findIndex(
    x => x.id === q.id
  );

  if (idx >= 0) {
    all[idx] = q;
  } else {
    all.push(q);
  }

  localStorage.setItem(
    'autodevis_quotes',
    JSON.stringify(all)
  );

  activeId = q.id;
  render();

  alert('Devis enregistré sur cet appareil.');
};

$('print').onclick = () => window.print();

$('new').onclick = () => {
  activeId = null;

  fields.forEach(f => {
    $(f).value = '';
  });

  $('date').value =
    new Date().toLocaleDateString('en-CA');

  $('number').value =
    'DEV-' + Date.now().toString().slice(-8);

  $('validity').value = '30';
  $('vat').value = '20';

  $('items').innerHTML = '';

  line();
  calc();
};

$('export').onclick = () => {
  const blob = new Blob(
    [JSON.stringify(readAll(), null, 2)],
    { type: 'application/json' }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'autodevis-sauvegarde.json';
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

$('import').onchange = async e => {
  try {
    const file = e.target.files[0];

    if (!file) return;

    const data = JSON.parse(await file.text());

    if (
      !Array.isArray(data) ||
      !data.every(q =>
        q &&
        typeof q.id === 'string' &&
        Array.isArray(q.items)
      )
    ) {
      throw Error('Format invalide');
    }

    if (!confirm(
      'Remplacer tous les devis locaux ?'
    )) return;

    localStorage.setItem(
      'autodevis_quotes',
      JSON.stringify(data)
    );

    render();
  } catch (err) {
    alert('Import impossible : ' + err.message);
  }
};

$('new').click();
render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .catch(() => {});
}

const state={siswa:[],program:[],tagihan:[],pembayaran:[]};
const dashboardCacheKey="salwa-music-dashboard-stats-v1";
const settingsStorageKey="salwa-music-settings-v1";
const appSettings={name:"Salwa Music",adminName:"Admin",address:"Jl. Panembahan Senopati No. 45, Gondomanan, Yogyakarta",phone:"0812-3456-7890",bank:"",accountName:"",accountNumber:"",logoData:""};
const dashboardCharts={income:null,invoiceStatus:null};
let dashboardPeriod="month";
const selectedInvoices=new Set();
const $=id=>document.getElementById(id);
const rupiah=value=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(value)||0);
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
const todayISO=()=>{const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`};
const dateText=value=>value?new Date(`${value.slice(0,10)}T00:00:00`).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}):"-";
const pageTitles={dashboard:"Dashboard",siswa:"Data siswa",program:"Program kursus",tagihan:"Tagihan",pembayaran:"Pembayaran",laporan:"Laporan",pengaturan:"Pengaturan",pengguna:"Manajemen Pengguna"};
let toastTimer;
let siswaPage=1;
const siswaPageSize=10;
let pendingLogoData=null;

function toast(message){const element=$("toast");element.textContent=message;element.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.remove("show"),2800)}
function restoreDashboardCache(){
  try{
    const cachedDashboard=JSON.parse(localStorage.getItem(dashboardCacheKey)||"null");
    const statIds=["statIncome","incomeCount","statReceivable","receivableCount","statStudents","statPrograms"];
    if(cachedDashboard?.month!==todayISO().slice(0,7)||cachedDashboard.period!==$("dashboardPeriod").value||!statIds.every(id=>typeof cachedDashboard.values?.[id]==="string"))return;
    statIds.forEach(id=>$(id).textContent=cachedDashboard.values[id]);
  }catch{}
}
$("todayText").textContent=new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
document.querySelectorAll(".nav-item").forEach(button=>button.addEventListener("click",()=>showPage(button.dataset.page)));
document.querySelectorAll("[data-go]").forEach(button=>button.addEventListener("click",()=>showPage(button.dataset.go)));
function showPage(page){document.querySelectorAll(".page").forEach(section=>section.classList.toggle("active-page",section.id===page));document.querySelectorAll(".nav-item").forEach(button=>button.classList.toggle("active",button.dataset.page===page));$("pageTitle").textContent=pageTitles[page]||pageTitles.dashboard}
function restoreSettings(){try{Object.assign(appSettings,JSON.parse(localStorage.getItem(settingsStorageKey)||"{}"))}catch{}pendingLogoData=appSettings.logoData;applySettings()}
function applySettings(){
  document.title=`${appSettings.name} | Pendapatan & Piutang`;
  document.querySelector(".brand strong").textContent=appSettings.name;
  const brandMark=document.querySelector(".brand-mark");brandMark.replaceChildren();
  if(appSettings.logoData){const logo=document.createElement("img");logo.src=appSettings.logoData;logo.alt=`Logo ${appSettings.name}`;brandMark.append(logo);brandMark.classList.add("has-logo")}else{brandMark.classList.remove("has-logo");brandMark.textContent=appSettings.name.trim().charAt(0).toLocaleUpperCase("id")||"S"}
  document.querySelector(".avatar").textContent=appSettings.name.split(/\s+/).filter(Boolean).map(word=>word[0]).slice(0,2).join("").toLocaleUpperCase("id")||"SM";
  document.querySelector(".sidebar-bottom small").textContent=`${appSettings.name.toLocaleUpperCase("id")} · 2026`;
  $("settingName").value=appSettings.name;$("settingAdmin").value=appSettings.adminName;$("settingAddress").value=appSettings.address;$("settingPhone").value=appSettings.phone;$("settingBank").value=appSettings.bank;$("settingAccountName").value=appSettings.accountName;$("settingAccountNumber").value=appSettings.accountNumber;
  const preview=$("settingLogoPreview");preview.classList.toggle("hidden",!appSettings.logoData);if(appSettings.logoData)preview.src=appSettings.logoData;
}
$("settingLogo").addEventListener("change",event=>{const file=event.target.files?.[0];if(!file)return;if(file.size>500*1024){toast("Ukuran logo maksimal 500 KB.");event.target.value="";return}const reader=new FileReader();reader.onload=()=>{pendingLogoData=String(reader.result);$("settingLogoPreview").src=pendingLogoData;$("settingLogoPreview").classList.remove("hidden")};reader.readAsDataURL(file)});
$("removeSettingLogo").addEventListener("click",()=>{pendingLogoData="";$("settingLogoPreview").removeAttribute("src");$("settingLogoPreview").classList.add("hidden");$("settingLogo").value=""});
$("settingsForm").addEventListener("submit",event=>{event.preventDefault();Object.assign(appSettings,{name:$("settingName").value.trim()||"Salwa Music",adminName:$("settingAdmin").value.trim()||"Admin",address:$("settingAddress").value.trim(),phone:$("settingPhone").value.trim(),bank:$("settingBank").value.trim(),accountName:$("settingAccountName").value.trim(),accountNumber:$("settingAccountNumber").value.trim(),logoData:pendingLogoData??appSettings.logoData});try{localStorage.setItem(settingsStorageKey,JSON.stringify(appSettings))}catch{return toast("Pengaturan tidak dapat disimpan di browser ini.")}applySettings();toast("Pengaturan tersimpan di perangkat ini.")});
$("dashboardPeriod").addEventListener("change",()=>{dashboardPeriod=$("dashboardPeriod").value;renderStats();renderDashboardCharts()});
$("notificationToggle").addEventListener("click",()=>{const panel=$("notificationPanel");const isOpen=panel.classList.toggle("hidden")===false;$("notificationToggle").setAttribute("aria-expanded",String(isOpen))});
document.addEventListener("click",event=>{if(!event.target.closest(".notification-wrap")){$("notificationPanel").classList.add("hidden");$("notificationToggle").setAttribute("aria-expanded","false")}});
$("notificationList").addEventListener("click",event=>{const item=event.target.closest("[data-notification-page]");if(item){showPage(item.dataset.notificationPage);$("notificationPanel").classList.add("hidden");$("notificationToggle").setAttribute("aria-expanded","false")}});
function openModal(content){$("modalOverlay").querySelector(".modal-card").classList.remove("receipt-modal");$("modalContent").innerHTML=content;$("modalOverlay").classList.remove("hidden");$("modalOverlay").querySelector("input,select,textarea")?.focus()}
function closeModal(){$("modalOverlay").classList.add("hidden");$("modalContent").innerHTML="";$("modalOverlay").querySelector(".modal-card").classList.remove("receipt-modal")}
$("modalClose").addEventListener("click",closeModal);
$("modalOverlay").addEventListener("click",event=>{if(event.target.id==="modalOverlay")closeModal()});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeModal()});

async function loadAll(){
  const results=await Promise.all([
    supabaseClient.from("siswa").select("*").order("nama_siswa"),
    supabaseClient.from("program_kursus").select("*").order("nama_program"),
    supabaseClient.from("tagihan").select("*").order("tanggal_jatuh_tempo",{ascending:false}),
    supabaseClient.from("pembayaran").select("*").order("tanggal_bayar",{ascending:false}).order("id_pembayaran",{ascending:false})
  ]);
  const failure=results.find(result=>result.error);
  if(failure){console.error(failure.error);toast("Gagal memuat data. Periksa config.js dan jalankan database.sql di Supabase.");return}
  [state.siswa,state.program,state.tagihan,state.pembayaran]=results.map(result=>result.data||[]);
  renderAll();
}
function paidAmount(invoiceId){return state.pembayaran.filter(payment=>payment.id_tagihan===invoiceId).reduce((sum,payment)=>sum+Number(payment.jumlah_bayar),0)}
function balance(invoice){return Math.max(0,Number(invoice.jumlah_tagihan)-paidAmount(invoice.id_tagihan))}
function invoiceStatus(invoice){const paid=paidAmount(invoice.id_tagihan);return paid===0?"Belum dibayar":balance(invoice)===0?"Lunas":"Sebagian"}
function studentName(id){return state.siswa.find(student=>student.id_siswa===id)?.nama_siswa||"Siswa dihapus"}
function programName(id){return state.program.find(program=>program.id_program===id)?.nama_program||"Program dihapus"}
function invoiceNumber(id){return `INV-${String(id).padStart(4,"0")}`}
function statusBadge(status){const className=status==="Lunas"||status==="Aktif"?"paid":status==="Sebagian"?"partial":status==="Nonaktif"?"":"unpaid";const activeClass=status==="Aktif"?" active":"";return `<span class="status-badge ${className}${activeClass}">${status}</span>`}
function emptyRow(columns,message){return `<tr><td colspan="${columns}" class="empty">${message}</td></tr>`}
function renderAll(){renderStats();renderDashboardCharts();renderDashboard();renderNotifications();renderSiswa();renderProgram();renderTagihan();renderPembayaran();renderReports()}

function dashboardPeriodStart(period=dashboardPeriod,now=new Date()){
  if(period==="year")return new Date(now.getFullYear(),0,1);
  if(period==="quarter")return new Date(now.getFullYear(),now.getMonth()-2,1);
  return new Date(now.getFullYear(),now.getMonth(),1);
}
function paymentsForDashboardPeriod(period=dashboardPeriod){
  const start=dashboardPeriodStart(period);const end=new Date();end.setHours(23,59,59,999);
  return state.pembayaran.filter(payment=>{const date=new Date(`${payment.tanggal_bayar}T00:00:00`);return date>=start&&date<=end});
}
function dashboardTrendBuckets(period=dashboardPeriod){
  const now=new Date();
  if(period==="month"){
    return Array.from({length:now.getDate()},(_,index)=>{const date=new Date(now.getFullYear(),now.getMonth(),index+1);const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;return{key,label:String(date.getDate())}});
  }
  const count=period==="year"?now.getMonth()+1:3;const firstMonth=period==="year"?0:now.getMonth()-2;
  return Array.from({length:count},(_,index)=>{const date=new Date(now.getFullYear(),firstMonth+index,1);const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;return{key,label:new Intl.DateTimeFormat("id-ID",{month:"short"}).format(date)}});
}

function renderDashboardCharts(){
  if(!window.Chart)return;
  const buckets=dashboardTrendBuckets();const revenue=new Map(buckets.map(bucket=>[bucket.key,0]));
  paymentsForDashboardPeriod().forEach(payment=>{
    const date=payment.tanggal_bayar?.slice(0,10)||"";const key=dashboardPeriod==="month"?date:date.slice(0,7);
    if(revenue.has(key))revenue.set(key,revenue.get(key)+Number(payment.jumlah_bayar||0));
  });
  const periodLabels={month:"Bulan ini",quarter:"3 bulan terakhir",year:"Tahun ini"};
  $("chartPeriod").textContent=periodLabels[dashboardPeriod];
  $("incomeChartEyebrow").textContent=dashboardPeriod==="month"?"PENDAPATAN HARIAN":dashboardPeriod==="quarter"?"PENDAPATAN 3 BULAN":"PENDAPATAN TAHUNAN";
  $("incomeChartSubtitle").textContent=dashboardPeriod==="month"?"Pembayaran harian pada bulan berjalan.":dashboardPeriod==="quarter"?"Total penerimaan per bulan selama 3 bulan terakhir.":"Total penerimaan per bulan pada tahun berjalan.";
  $("incomeChart").setAttribute("aria-label",dashboardPeriod==="month"?"Grafik pendapatan harian bulan berjalan":dashboardPeriod==="quarter"?"Grafik pendapatan tiga bulan terakhir":"Grafik pendapatan tahun berjalan");
  const statusLabels=["Belum dibayar","Sebagian","Lunas"];
  const statusValues=statusLabels.map(status=>state.tagihan.filter(invoice=>invoiceStatus(invoice)===status).length);
  $("invoiceStatusTotal").textContent=state.tagihan.length;

  dashboardCharts.income?.destroy();
  dashboardCharts.income=new Chart($("incomeChart"),{
    type:"line",
    data:{labels:buckets.map(bucket=>bucket.label),datasets:[{data:buckets.map(bucket=>revenue.get(bucket.key)),borderColor:"#9a7844",backgroundColor:"rgba(198,164,107,.16)",fill:true,tension:.36,borderWidth:2,pointRadius:dashboardPeriod==="month"?1.5:3,pointHoverRadius:5,pointBackgroundColor:"#fff",pointBorderColor:"#9a7844",pointBorderWidth:2}]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:500},plugins:{legend:{display:false},tooltip:{callbacks:{label:context=>rupiah(context.raw)}}},scales:{x:{grid:{display:false},border:{display:false},ticks:{autoSkip:true,maxTicksLimit:dashboardPeriod==="month"?8:12,color:"#78828f",font:{family:"Plus Jakarta Sans",size:10}}},y:{beginAtZero:true,grid:{color:"rgba(23,41,69,.07)"},border:{display:false},ticks:{maxTicksLimit:5,color:"#78828f",font:{family:"Plus Jakarta Sans",size:9},callback:value=>new Intl.NumberFormat("id-ID",{notation:"compact",maximumFractionDigits:1}).format(value)}}}}
  });

  dashboardCharts.invoiceStatus?.destroy();
  dashboardCharts.invoiceStatus=new Chart($("invoiceStatusChart"),{
    type:"doughnut",
    data:{labels:statusLabels,datasets:[{data:statusValues,backgroundColor:["#d7c4a3","#8196a9","#7d967d"],borderColor:"#fff",borderWidth:4,hoverOffset:5}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"72%",animation:{duration:700},plugins:{legend:{position:"bottom",labels:{usePointStyle:true,pointStyle:"circle",boxWidth:8,padding:14,color:"#526174",font:{family:"Plus Jakarta Sans",size:10}}},tooltip:{callbacks:{label:context=>`${context.label}: ${context.raw} tagihan`}}}}
  });
}

function renderStats(){
  const periodPayments=paymentsForDashboardPeriod();const periodNames={month:"bulan ini",quarter:"3 bulan terakhir",year:"tahun ini"};
  const outstanding=state.tagihan.reduce((sum,invoice)=>sum+balance(invoice),0);
  const dashboardStats={
    statIncome:rupiah(periodPayments.reduce((sum,payment)=>sum+Number(payment.jumlah_bayar),0)),
    incomeCount:`${periodPayments.length} pembayaran ${periodNames[dashboardPeriod]}`,
    statReceivable:rupiah(outstanding),
    receivableCount:`${state.tagihan.filter(invoice=>balance(invoice)>0).length} tagihan belum lunas`,
    statStudents:String(state.siswa.filter(student=>student.aktif).length),
    statPrograms:String(state.program.filter(program=>program.aktif).length)
  };
  $("statIncome").parentElement.querySelector("p").textContent=`Pendapatan ${periodNames[dashboardPeriod]}`;
  Object.entries(dashboardStats).forEach(([id,value])=>$(id).textContent=value);
  try{localStorage.setItem(dashboardCacheKey,JSON.stringify({month:todayISO().slice(0,7),period:dashboardPeriod,values:dashboardStats}))}catch{}
}
function renderNotifications(){
  const today=todayISO();
  const dueToday=state.tagihan.filter(invoice=>invoice.tanggal_jatuh_tempo===today&&balance(invoice)>0);
  const newStudents=state.siswa.filter(student=>student.tanggal_daftar===today);
  const notifications=[...dueToday.map(invoice=>({page:"tagihan",title:`Tagihan ${invoiceNumber(invoice.id_tagihan)} jatuh tempo hari ini`,detail:`${studentName(invoice.id_siswa)} · ${rupiah(balance(invoice))}`})),...newStudents.map(student=>({page:"siswa",title:`Siswa baru: ${student.nama_siswa}`,detail:"Terdaftar hari ini"}))];
  $("notificationCount").textContent=String(notifications.length);
  $("notificationCount").classList.toggle("hidden",notifications.length===0);
  $("notificationList").innerHTML=notifications.map(item=>`<button class="notification-item" type="button" data-notification-page="${item.page}"><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span></button>`).join("")||`<p class="notification-empty">Tidak ada notifikasi hari ini.</p>`;
}
function renderDashboard(){
  const openInvoices=state.tagihan.filter(invoice=>balance(invoice)>0).sort((first,second)=>first.tanggal_jatuh_tempo.localeCompare(second.tanggal_jatuh_tempo)).slice(0,5);
  $("duePreview").innerHTML=openInvoices.map(invoice=>`<tr><td class="item-name">${esc(studentName(invoice.id_siswa))}<small class="cell-sub">${esc(programName(invoice.id_program))}</small></td><td>${dateText(invoice.tanggal_jatuh_tempo)}</td><td class="amount">${rupiah(balance(invoice))}</td><td>${statusBadge(invoiceStatus(invoice))}</td></tr>`).join("")||emptyRow(4,"Tidak ada tagihan yang perlu ditindaklanjuti.");
  $("paymentPreview").innerHTML=state.pembayaran.slice(0,5).map(payment=>`<div class="activity-item"><span class="activity-mark" aria-hidden="true">↗</span><div class="activity-copy"><strong>${esc(studentName(state.tagihan.find(invoice=>invoice.id_tagihan===payment.id_tagihan)?.id_siswa))}</strong><small>${dateText(payment.tanggal_bayar)} · ${esc(payment.metode)}</small></div><b>${rupiah(payment.jumlah_bayar)}</b></div>`).join("")||`<div class="empty-block">Belum ada pembayaran tercatat.</div>`;
}

function renderSiswa(){
  const query=$("searchSiswa").value.trim().toLocaleLowerCase("id");const statusFilter=$("filterSiswaStatus").value;const programSelect=$("filterSiswaProgram");const selectedProgram=programSelect.value;programSelect.innerHTML=`<option value="semua">Semua program</option>${state.program.map(program=>`<option value="${program.id_program}">${esc(program.nama_program)}</option>`).join("")}`;programSelect.value=state.program.some(program=>String(program.id_program)===selectedProgram)?selectedProgram:"semua";const programFilter=programSelect.value;
  const filtered=state.siswa.filter(student=>{
    const matchesQuery=`${student.nama_siswa} ${student.no_telepon||""} ${student.email||""}`.toLocaleLowerCase("id").includes(query);
    const matchesStatus=statusFilter==="semua"||(statusFilter==="aktif"&&student.aktif!==false)||(statusFilter==="nonaktif"&&student.aktif===false);
    const matchesProgram=programFilter==="semua"||state.tagihan.some(invoice=>invoice.id_siswa===student.id_siswa&&String(invoice.id_program)===programFilter);
    return matchesQuery&&matchesStatus&&matchesProgram;
  });
  const pageCount=Math.max(1,Math.ceil(filtered.length/siswaPageSize));siswaPage=Math.min(siswaPage,pageCount);
  const start=(siswaPage-1)*siswaPageSize;const pageItems=filtered.slice(start,start+siswaPageSize);
  const rows=pageItems.map(student=>`<tr><td><button class="student-detail-link" onclick="openStudentDetail(${student.id_siswa})">${esc(student.nama_siswa)}</button></td><td>${esc(student.no_telepon||"-")}</td><td>${esc(student.email||"-")}</td><td>${dateText(student.tanggal_daftar)}</td><td>${statusBadge(student.aktif?"Aktif":"Nonaktif")}</td><td><div class="action-group"><button class="icon-btn edit-btn" aria-label="Edit siswa" onclick="editSiswa(${student.id_siswa})">✎</button><button class="icon-btn delete-btn" aria-label="Hapus siswa" onclick="deleteSiswa(${student.id_siswa})">×</button></div></td></tr>`).join("");
  $("siswaTable").innerHTML=rows||emptyRow(6,"Belum ada siswa yang cocok dengan filter.");
  $("siswaSummary").textContent=filtered.length?`${start+1}–${Math.min(start+siswaPageSize,filtered.length)} dari ${filtered.length} siswa`:"0 siswa";
  $("siswaPageInfo").textContent=`Halaman ${siswaPage} dari ${pageCount}`;
  $("siswaPrevious").disabled=siswaPage<=1;$("siswaNext").disabled=siswaPage>=pageCount;
}
function renderProgram(){
  const programPhotos={
    Piano:"https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=800&q=82",
    Gitar:"https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=82",
    Vokal:"https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=82",
    Biola:"https://images.unsplash.com/photo-1597591578307-941860622461?auto=format&fit=crop&w=800&q=82",
    Keyboard:"https://images.unsplash.com/photo-1781624448097-4e78d7d919f3?auto=format&fit=crop&w=800&q=82"
  };
  const coursePhotos={
    "kursus biola pemula":programPhotos.Biola,
    "kursus gitar akustik":"https://images.unsplash.com/photo-1536594527669-2f555de54e95?fit=crop&crop=entropy&w=1280&h=720&q=85",
    "kursus gitar lanjutan":"https://images.unsplash.com/photo-1459305272254-33a7d593a851?fit=crop&crop=entropy&w=1280&h=720&q=85",
    "kursus gitar pemula":programPhotos.Gitar,
    "kursus keyboard":programPhotos.Keyboard,
    "kursus piano lanjutan":programPhotos.Piano,
    "kursus piano pemula":"https://images.unsplash.com/photo-1652181820522-cc76583c9950?fit=crop&crop=entropy&w=1280&h=720&q=85",
    "kursus vokal dasar":programPhotos.Vokal
  };
  const programDescriptions={
    Piano:"Bangun teknik, membaca not, dan ekspresi bermain.",
    Gitar:"Pelajari akor, ritme, dan lagu langkah demi langkah.",
    Vokal:"Latih pernapasan, intonasi, dan kepercayaan diri.",
    Biola:"Kenali teknik gesek, intonasi, dan musikalitas.",
    Keyboard:"Eksplorasi harmoni dan iringan dengan keyboard."
  };
  const categoryFilter=$("filterProgramInstrument");const selectedCategory=categoryFilter.value||"semua";const instruments=[...new Set(state.program.map(program=>program.instrumen))].sort((a,b)=>a.localeCompare(b,"id"));
  categoryFilter.innerHTML=`<option value="semua">Semua kategori</option>${instruments.map(instrument=>`<option value="${esc(instrument)}">${esc(instrument)}</option>`).join("")}`;
  categoryFilter.value=instruments.includes(selectedCategory)?selectedCategory:"semua";
  const query=$("searchProgram").value.trim().toLocaleLowerCase("id");
  const filteredPrograms=state.program.filter(program=>`${program.nama_program} ${program.instrumen}`.toLocaleLowerCase("id").includes(query)&&(categoryFilter.value==="semua"||program.instrumen===categoryFilter.value));
  $("programCards").innerHTML=filteredPrograms.map(program=>{
    const active=program.aktif!==false;const image=coursePhotos[program.nama_program.trim().toLocaleLowerCase("id")]||programPhotos[program.instrumen]||programPhotos.Piano;const description=programDescriptions[program.instrumen]||"Kembangkan kemampuan musik dengan bimbingan terarah.";
    const studentCount=new Set(state.tagihan.filter(invoice=>invoice.id_program===program.id_program).map(invoice=>invoice.id_siswa)).size;
    return `<article class="program-card ${active?"":"is-inactive"}"><button class="program-card-select" type="button" data-select-program="${program.id_program}" ${active?"":"disabled"} aria-label="Pilih ${esc(program.nama_program)} untuk membuat tagihan"><figure class="program-card-image"><img src="${image}" alt="Instrumen ${esc(program.instrumen)}" loading="lazy"><span class="program-image-tag">${esc(program.instrumen)}</span></figure><div class="program-card-body"><div class="program-card-title"><h3>${esc(program.nama_program)}</h3>${statusBadge(active?"Aktif":"Nonaktif")}</div><p>${description}</p><div class="program-card-meta"><span>${program.durasi_menit} menit / pertemuan</span><strong>${rupiah(program.biaya_bulanan)}<small> / bulan</small></strong></div><div class="program-card-extra"><span>${studentCount} siswa tercatat</span></div><span class="program-card-cta">${active?"Pilih & buat tagihan":"Program nonaktif"}<span aria-hidden="true">→</span></span></div></button><div class="program-card-tools"><button class="icon-btn edit-btn" aria-label="Edit program" onclick="editProgram(${program.id_program})">✎</button><button class="icon-btn delete-btn" aria-label="Hapus program" onclick="deleteProgram(${program.id_program})">×</button></div></article>`;
  }).join("")||`<div class="content-panel empty-block">Tidak ada program yang cocok dengan pencarian.</div>`;
  $("programCards").querySelectorAll("[data-select-program]").forEach(button=>button.addEventListener("click",()=>{showPage("tagihan");tagihanForm(null,Number(button.dataset.selectProgram))}));
}
function renderTagihan(){
  const query=$("searchTagihan").value.trim().toLocaleLowerCase("id");const filter=$("filterTagihan").value;
  const filtered=state.tagihan.filter(invoice=>`${studentName(invoice.id_siswa)} ${programName(invoice.id_program)} ${invoice.keterangan||""}`.toLocaleLowerCase("id").includes(query)&&(filter==="semua"||invoiceStatus(invoice)===filter));
  const rows=filtered.map(invoice=>{const remaining=balance(invoice);const student=state.siswa.find(item=>item.id_siswa===invoice.id_siswa);return `<tr><td><input class="invoice-select" type="checkbox" aria-label="Pilih ${invoiceNumber(invoice.id_tagihan)}" data-invoice-select="${invoice.id_tagihan}" ${selectedInvoices.has(invoice.id_tagihan)?"checked":""} ${remaining===0?"disabled":""}></td><td><span class="id-pill">${invoiceNumber(invoice.id_tagihan)}</span></td><td class="item-name">${esc(studentName(invoice.id_siswa))}<small class="cell-sub">${esc(programName(invoice.id_program))}</small></td><td>${esc(invoice.periode)}</td><td>${dateText(invoice.tanggal_jatuh_tempo)}</td><td>${rupiah(invoice.jumlah_tagihan)}</td><td class="amount">${rupiah(remaining)}</td><td>${statusBadge(invoiceStatus(invoice))}</td><td><div class="action-group"><button class="icon-btn reminder-btn" aria-label="Kirim pengingat WhatsApp" title="Kirim pengingat via WhatsApp" onclick="openInvoiceReminder(${invoice.id_tagihan})" ${student?.no_telepon?"":"disabled"}>WA</button><button class="icon-btn edit-btn" aria-label="Edit tagihan" title="Edit tagihan" onclick="editTagihan(${invoice.id_tagihan})">✎</button><button class="icon-btn delete-btn" aria-label="Hapus tagihan" title="Hapus tagihan" onclick="deleteTagihan(${invoice.id_tagihan})">×</button></div></td></tr>`}).join("");
  $("tagihanTable").innerHTML=rows||emptyRow(9,"Belum ada tagihan untuk filter ini.");
  updateInvoiceSelection(filtered);
}
function updateInvoiceSelection(visibleInvoices=state.tagihan){
  const visibleOpen=visibleInvoices.filter(invoice=>balance(invoice)>0);const selectedVisible=visibleOpen.filter(invoice=>selectedInvoices.has(invoice.id_tagihan));
  $("selectAllInvoices").checked=visibleOpen.length>0&&selectedVisible.length===visibleOpen.length;
  $("selectAllInvoices").indeterminate=selectedVisible.length>0&&selectedVisible.length<visibleOpen.length;
  $("invoiceBulkBar").classList.toggle("hidden",selectedInvoices.size===0);
  $("selectedInvoiceCount").textContent=`${selectedInvoices.size} tagihan dipilih`;
}
function whatsappPhoneUrl(phone,message){
  let digits=String(phone||"").replace(/\D/g,"");if(digits.startsWith("00"))digits=digits.slice(2);if(digits.startsWith("0"))digits=`62${digits.slice(1)}`;else if(digits.startsWith("8"))digits=`62${digits}`;
  if(digits.length<10)return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
function invoiceReminder(invoice){
  const student=state.siswa.find(item=>item.id_siswa===invoice.id_siswa);const program=state.program.find(item=>item.id_program===invoice.id_program);
  const message=`Halo ${student?.nama_siswa||"Bapak/Ibu"}, kami mengingatkan sisa tagihan ${invoiceNumber(invoice.id_tagihan)} untuk ${program?.nama_program||"program kursus"} sebesar ${rupiah(balance(invoice))}, jatuh tempo ${dateText(invoice.tanggal_jatuh_tempo)}. Terima kasih. Salwa Music`;
  return{student,message,url:whatsappPhoneUrl(student?.no_telepon,message),invoice};
}
window.openInvoiceReminder=id=>{
  const invoice=state.tagihan.find(item=>item.id_tagihan===Number(id));if(!invoice)return;
  const reminder=invoiceReminder(invoice);if(!reminder.url)return toast("Nomor WhatsApp siswa belum valid.");
  openModal(`<h2 id="modalTitle" class="modal-title">Pengingat tagihan</h2><p class="modal-sub">${invoiceNumber(invoice.id_tagihan)} · ${esc(reminder.student.nama_siswa)} · ${rupiah(balance(invoice))}</p><div class="reminder-preview">${esc(reminder.message)}</div><a class="modal-submit reminder-link" href="${reminder.url}" target="_blank" rel="noopener">Buka WhatsApp</a>`);
};
window.openBulkInvoiceReminders=()=>{
  const invoices=state.tagihan.filter(invoice=>selectedInvoices.has(invoice.id_tagihan)&&balance(invoice)>0);
  if(!invoices.length)return toast("Pilih tagihan yang masih memiliki saldo.");
  const rows=invoices.map(invoice=>{const reminder=invoiceReminder(invoice);return `<div class="bulk-reminder-row"><div><strong>${esc(reminder.student?.nama_siswa||"Siswa")}</strong><span>${invoiceNumber(invoice.id_tagihan)} · ${rupiah(balance(invoice))}</span></div>${reminder.url?`<a class="secondary-btn" href="${reminder.url}" target="_blank" rel="noopener">Buka WhatsApp</a>`:`<span class="muted">Nomor belum valid</span>`}</div>`}).join("");
  openModal(`<h2 id="modalTitle" class="modal-title">Kirim pengingat</h2><p class="modal-sub">Pilih “Buka WhatsApp” pada tiap siswa untuk meninjau dan mengirim pesannya.</p><div class="bulk-reminder-list">${rows}</div>`);
};
function renderPembayaran(){
  const query=$("searchPembayaran").value.trim().toLocaleLowerCase("id");
  const start=$("paymentDateFrom").value;const end=$("paymentDateTo").value;
  const periodPayments=state.pembayaran.filter(payment=>{const date=payment.tanggal_bayar?.slice(0,10)||"";return(!start||date>=start)&&(!end||date<=end)});
  $("paymentFilteredTotal").textContent=`${periodPayments.length} pembayaran · Total penerimaan ${rupiah(periodPayments.reduce((sum,payment)=>sum+Number(payment.jumlah_bayar),0))}`;
  const rows=periodPayments.filter(payment=>{const invoice=state.tagihan.find(item=>item.id_tagihan===payment.id_tagihan);return `${studentName(invoice?.id_siswa)} ${payment.referensi||""} ${invoiceNumber(payment.id_tagihan)}`.toLocaleLowerCase("id").includes(query)}).map(payment=>{const invoice=state.tagihan.find(item=>item.id_tagihan===payment.id_tagihan);return `<tr><td>${dateText(payment.tanggal_bayar)}</td><td class="item-name">${esc(studentName(invoice?.id_siswa))}</td><td><span class="id-pill">${invoiceNumber(payment.id_tagihan)}</span></td><td>${esc(payment.metode)}</td><td>${esc(payment.referensi||"-")}</td><td class="amount">${rupiah(payment.jumlah_bayar)}</td><td><div class="action-group"><button class="icon-btn print-btn" aria-label="Cetak struk pembayaran" title="Cetak struk" onclick="openPaymentReceipt(${payment.id_pembayaran})">⎙</button><button class="icon-btn edit-btn" aria-label="Edit pembayaran" title="Edit pembayaran" onclick="editPembayaran(${payment.id_pembayaran})">✎</button><button class="icon-btn delete-btn" aria-label="Hapus pembayaran" title="Hapus pembayaran" onclick="deletePembayaran(${payment.id_pembayaran})">×</button></div></td></tr>`}).join("");
  $("pembayaranTable").innerHTML=rows||emptyRow(7,"Belum ada pembayaran untuk pencarian ini.");
}
function renderReports(){
  const currentYear=new Date().getFullYear();const years=[...new Set([currentYear,...state.pembayaran.map(payment=>Number(payment.tanggal_bayar?.slice(0,4)))].filter(Number.isFinite))].sort((a,b)=>b-a);
  const yearSelect=$("reportYear");const selectedYear=years.includes(Number(yearSelect.value))?Number(yearSelect.value):currentYear;
  yearSelect.innerHTML=years.map(year=>`<option value="${year}">${year}</option>`).join("");yearSelect.value=String(selectedYear);
  const monthlyTotals=Array(12).fill(0);const monthlyCounts=Array(12).fill(0);
  state.pembayaran.forEach(payment=>{if(Number(payment.tanggal_bayar?.slice(0,4))===selectedYear){const month=Number(payment.tanggal_bayar.slice(5,7))-1;if(month>=0&&month<12){monthlyTotals[month]+=Number(payment.jumlah_bayar);monthlyCounts[month]++}}});
  $("reportYearIncome").textContent=rupiah(monthlyTotals.reduce((sum,value)=>sum+value,0));
  const openInvoices=state.tagihan.filter(invoice=>balance(invoice)>0).sort((a,b)=>a.tanggal_jatuh_tempo.localeCompare(b.tanggal_jatuh_tempo));
  const totalReceivables=openInvoices.reduce((sum,invoice)=>sum+balance(invoice),0);const overdue=openInvoices.filter(invoice=>invoice.tanggal_jatuh_tempo<todayISO()).reduce((sum,invoice)=>sum+balance(invoice),0);
  $("reportReceivables").textContent=rupiah(totalReceivables);$("reportOverdue").textContent=rupiah(overdue);
  const monthNames=Array.from({length:12},(_,month)=>new Intl.DateTimeFormat("id-ID",{month:"long"}).format(new Date(selectedYear,month,1)));
  $("reportIncomeTable").innerHTML=monthNames.map((month,index)=>`<tr><td>${month}</td><td>${monthlyCounts[index]}</td><td class="amount">${rupiah(monthlyTotals[index])}</td></tr>`).join("");
  $("reportReceivableTable").innerHTML=openInvoices.map(invoice=>`<tr><td><span class="id-pill">${invoiceNumber(invoice.id_tagihan)}</span></td><td class="item-name">${esc(studentName(invoice.id_siswa))}</td><td>${dateText(invoice.tanggal_jatuh_tempo)}</td><td class="amount">${rupiah(balance(invoice))}</td></tr>`).join("")||emptyRow(4,"Tidak ada tunggakan.");
  $("reportCaveat").textContent="Laporan ini murni menampilkan penerimaan kas dan posisi piutang.";
}
function showPaymentReceipt(payment){
  const invoice=state.tagihan.find(item=>item.id_tagihan===payment.id_tagihan);
  const student=state.siswa.find(item=>item.id_siswa===invoice?.id_siswa);
  const program=state.program.find(item=>item.id_program===invoice?.id_program);
  const receiptYear=payment.tanggal_bayar?.slice(0,4)||String(new Date().getFullYear());const receiptNumber=`KWT-${receiptYear}-${String(payment.id_pembayaran).padStart(4,"0")}`;
  const remaining=invoice?balance(invoice):0;
  const stampText=invoice&&remaining===0?"PAID / LUNAS":"PEMBAYARAN DITERIMA";
  openModal(`<div class="receipt-actions no-print"><button class="secondary-btn" id="receiptClose">Tutup</button><button class="primary-btn" id="receiptPrint"><span aria-hidden="true">⎙</span> Cetak</button></div><article id="receiptPrintArea" class="receipt-paper"><header class="receipt-header"><span class="receipt-mark" aria-hidden="true">♫</span><h2 id="modalTitle">Salwa Music</h2><p>Administrasi Kursus Musik</p><p>Jl. Panembahan Senopati No. 45, Gondomanan, Yogyakarta</p><p>Telepon: 0812-3456-7890</p><h3>STRUK PEMBAYARAN</h3></header><section class="receipt-section"><h3>INFO TRANSAKSI</h3><div class="receipt-row"><span>No. Struk</span><strong>${receiptNumber}</strong></div><div class="receipt-row"><span>Tanggal</span><strong>${dateText(payment.tanggal_bayar)}</strong></div><div class="receipt-row"><span>Metode</span><strong>${esc(payment.metode||"-")}</strong></div><div class="receipt-row"><span>Referensi</span><strong>${esc(payment.referensi||"-")}</strong></div></section><section class="receipt-section"><h3>INFO SISWA</h3><div class="receipt-row"><span>Nama</span><strong>${esc(student?.nama_siswa||"Siswa tidak ditemukan")}</strong></div><div class="receipt-row"><span>Program</span><strong>${esc(program?.nama_program||"-")}</strong></div><div class="receipt-row"><span>No. Tagihan</span><strong>${invoiceNumber(payment.id_tagihan)}</strong></div></section><section class="receipt-section receipt-totals"><h3>RINCIAN</h3><div class="receipt-row"><span>Total Tagihan</span><strong>${rupiah(invoice?.jumlah_tagihan)}</strong></div><div class="receipt-row receipt-paid"><span>Jumlah Bayar</span><strong>${rupiah(payment.jumlah_bayar)}</strong></div><div class="receipt-row"><span>Sisa Tagihan</span><strong>${rupiah(remaining)}</strong></div></section><div class="receipt-approval"><div class="receipt-stamp" aria-label="${stampText}"><strong>SALWA MUSIC</strong><span>${stampText}</span></div><div class="receipt-signature"><span>Admin</span><strong class="receipt-signature-name">Admin Salwa Music</strong><div class="receipt-signature-line"></div><small>Tanda tangan / stempel</small></div></div><footer class="receipt-footer">Terima kasih telah melakukan pembayaran.<br>Salwa Music · Musik untuk semua</footer></article>`);
  const approval=document.querySelector(".receipt-approval");
  const stamp=approval.querySelector(".receipt-stamp");
  const signature=approval.querySelector(".receipt-signature");
  const divider=signature.querySelector(".receipt-signature-line");
  const caption=signature.querySelector("small");
  const signatureArea=document.createElement("div");
  signatureArea.className="signature-area";
  const adminLine=document.createElement("p");
  adminLine.className="signature-admin";
  adminLine.textContent="Admin";
  const nameLine=document.createElement("p");
  nameLine.className="receipt-signature-name";
  nameLine.textContent="Salwa Music";
  caption.className="receipt-signature-caption";
  signatureArea.append(adminLine,nameLine,stamp);
  approval.replaceChildren(signatureArea,divider,caption);
  const headerParagraphs=$("receiptPrintArea").querySelectorAll(".receipt-header p");
  $("receiptPrintArea").querySelector(".receipt-header h2").textContent=appSettings.name;
  headerParagraphs[0].textContent="Administrasi Kursus Musik";headerParagraphs[1].textContent=appSettings.address;headerParagraphs[2].textContent=`Telepon: ${appSettings.phone}`;
  $("receiptPrintArea").querySelector(".signature-admin").textContent=appSettings.adminName;
  $("receiptPrintArea").querySelector(".receipt-signature-name").textContent=appSettings.name;
  $("receiptPrintArea").querySelector(".receipt-footer").innerHTML=`Terima kasih telah melakukan pembayaran.<br>${esc(appSettings.name)} · Musik untuk semua`;
  $("modalOverlay").querySelector(".modal-card").classList.add("receipt-modal");
  $("receiptPrint").onclick=()=>window.print();
  $("receiptClose").onclick=closeModal;
}
window.openPaymentReceipt=id=>{const payment=state.pembayaran.find(item=>item.id_pembayaran===Number(id));if(payment)showPaymentReceipt(payment)};

function bindSearch(id,render){$(id).addEventListener("input",render)}
bindSearch("searchSiswa",()=>{siswaPage=1;renderSiswa()});bindSearch("searchTagihan",renderTagihan);bindSearch("searchPembayaran",renderPembayaran);bindSearch("searchProgram",renderProgram);
$("paymentDateFrom").addEventListener("change",renderPembayaran);$("paymentDateTo").addEventListener("change",renderPembayaran);
$("reportYear").addEventListener("change",renderReports);
$("filterSiswaStatus").addEventListener("change",()=>{siswaPage=1;renderSiswa()});
$("filterSiswaProgram").addEventListener("change",()=>{siswaPage=1;renderSiswa()});
$("filterProgramInstrument").addEventListener("change",renderProgram);
$("siswaPrevious").addEventListener("click",()=>{if(siswaPage>1){siswaPage--;renderSiswa()}});
$("siswaNext").addEventListener("click",()=>{siswaPage++;renderSiswa()});
$("filterTagihan").addEventListener("change",renderTagihan);
$("selectAllInvoices").addEventListener("change",()=>{
  const query=$("searchTagihan").value.trim().toLocaleLowerCase("id");const filter=$("filterTagihan").value;
  const visible=state.tagihan.filter(invoice=>`${studentName(invoice.id_siswa)} ${programName(invoice.id_program)} ${invoice.keterangan||""}`.toLocaleLowerCase("id").includes(query)&&(filter==="semua"||invoiceStatus(invoice)===filter));
  visible.filter(invoice=>balance(invoice)>0).forEach(invoice=>{if($("selectAllInvoices").checked)selectedInvoices.add(invoice.id_tagihan);else selectedInvoices.delete(invoice.id_tagihan)});renderTagihan();
});
$("tagihanTable").addEventListener("change",event=>{const checkbox=event.target.closest("[data-invoice-select]");if(!checkbox)return;const id=Number(checkbox.dataset.invoiceSelect);if(checkbox.checked)selectedInvoices.add(id);else selectedInvoices.delete(id);renderTagihan()});
$("clearInvoiceSelection").addEventListener("click",()=>{selectedInvoices.clear();renderTagihan()});
$("sendBulkReminders").addEventListener("click",openBulkInvoiceReminders);
function csvCell(value){return `"${String(value??"").replace(/"/g,'""')}"`}
function downloadCsv(filename,rows){const csv="\uFEFF"+rows.map(row=>row.map(csvCell).join(",")).join("\r\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url)}
$("exportSiswaBtn").addEventListener("click",()=>downloadCsv("data-siswa-salwa-music.csv",[["nama_siswa","no_telepon","email","tanggal_daftar","aktif"],...state.siswa.map(student=>[student.nama_siswa,student.no_telepon,student.email,student.tanggal_daftar,student.aktif])]));
$("importSiswaBtn").addEventListener("click",()=>$("importSiswaFile").click());
$("importSiswaFile").addEventListener("change",event=>{
  const file=event.target.files?.[0];if(!file)return;
  if(!window.Papa){toast("Parser CSV belum termuat. Periksa koneksi lalu coba lagi.");event.target.value="";return}
  Papa.parse(file,{header:true,skipEmptyLines:"greedy",transformHeader:header=>header.replace(/^\uFEFF/,"").trim(),complete:async result=>{
    if(result.errors.length){console.error(result.errors);toast("CSV tidak dapat dibaca. Periksa format file.");event.target.value="";return}
    const normalize=header=>header.toLocaleLowerCase("id").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\s_-]+/g,"");
    const existingEmails=new Set(state.siswa.map(student=>student.email?.trim().toLocaleLowerCase("id")).filter(Boolean));
    const seenEmails=new Set();let skipped=0;
    const records=result.data.map(row=>{
      const values=new Map(Object.entries(row).map(([key,value])=>[normalize(key),String(value??"").trim()]));
      const read=(...keys)=>keys.map(key=>values.get(normalize(key))).find(Boolean)||"";
      const name=read("nama_siswa","nama siswa","nama","name");const email=read("email");const registrationDate=read("tanggal_daftar","tanggal daftar","tanggal daftar siswa")||todayISO();
      if(!name||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(registrationDate)){skipped++;return null}
      const normalizedEmail=email.toLocaleLowerCase("id");if(normalizedEmail&&(existingEmails.has(normalizedEmail)||seenEmails.has(normalizedEmail))){skipped++;return null}
      if(normalizedEmail)seenEmails.add(normalizedEmail);
      const active=read("aktif","status").toLocaleLowerCase("id");
      return{nama_siswa:name,no_telepon:read("no_telepon","no telepon","telepon","phone")||null,email:email||null,tanggal_daftar:registrationDate,aktif:!active||["true","aktif","active","1","ya"].includes(active)};
    }).filter(Boolean);
    if(!records.length){toast("Tidak ada baris valid untuk diimpor.");event.target.value="";return}
    const {error}=await supabaseClient.from("siswa").insert(records);
    if(error)toast(`Impor gagal: ${error.message}`);else{toast(`${records.length} siswa diimpor${skipped?`; ${skipped} baris dilewati`:""}.`);await loadAll()}
    event.target.value="";
  }});
});
window.openStudentDetail=id=>{
  const student=state.siswa.find(item=>item.id_siswa===Number(id));if(!student)return;
  const invoices=state.tagihan.filter(invoice=>invoice.id_siswa===student.id_siswa);
  const invoiceRows=invoices.map(invoice=>`<tr><td>${invoiceNumber(invoice.id_tagihan)}</td><td>${esc(programName(invoice.id_program))}</td><td>${esc(invoice.periode)}</td><td>${rupiah(balance(invoice))}</td><td>${statusBadge(invoiceStatus(invoice))}</td></tr>`).join("");
  const payments=state.pembayaran.filter(payment=>invoices.some(invoice=>invoice.id_tagihan===payment.id_tagihan)).sort((a,b)=>b.tanggal_bayar.localeCompare(a.tanggal_bayar));
  const paymentRows=payments.map(payment=>`<tr><td>${dateText(payment.tanggal_bayar)}</td><td>${invoiceNumber(payment.id_tagihan)}</td><td>${esc(payment.metode)}</td><td>${rupiah(payment.jumlah_bayar)}</td></tr>`).join("");
  openModal(`<h2 id="modalTitle" class="modal-title">${esc(student.nama_siswa)}</h2><p class="modal-sub">${esc(student.no_telepon||"Tanpa nomor telepon")} · ${esc(student.email||"Tanpa email")} · ${statusBadge(student.aktif?"Aktif":"Nonaktif")}</p><div class="student-detail-section"><h3>Riwayat kursus & tagihan</h3><div class="table-wrap"><table><thead><tr><th>Tagihan</th><th>Program</th><th>Periode</th><th>Sisa</th><th>Status</th></tr></thead><tbody>${invoiceRows||`<tr><td colspan="5" class="empty">Belum ada riwayat kursus.</td></tr>`}</tbody></table></div></div><div class="student-detail-section"><h3>Riwayat pembayaran</h3><div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Tagihan</th><th>Metode</th><th>Jumlah</th></tr></thead><tbody>${paymentRows||`<tr><td colspan="4" class="empty">Belum ada pembayaran.</td></tr>`}</tbody></table></div></div>`);
};
async function saveRecord(table,payload,idColumn,id){const query=id?supabaseClient.from(table).update(payload).eq(idColumn,id):supabaseClient.from(table).insert(payload);const {error}=await query;if(error){toast(error.message);return false}closeModal();await loadAll();return true}
function modalForm(title,subtitle,fields,buttonText){return `<h2 id="modalTitle" class="modal-title">${title}</h2><p class="modal-sub">${subtitle}</p><form id="recordForm" class="form-grid">${fields}<button class="modal-submit" type="submit">${buttonText}</button></form>`}
function field(label,id,value="",type="text",required=true,extra=""){return `<div class="form-group"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}" ${required?"required":""} ${extra}></div>`}
function selectField(label,id,options,value){return `<div class="form-group"><label for="${id}">${label}</label><select id="${id}" required>${options.map(option=>`<option value="${option.value}" ${String(option.value)===String(value)?"selected":""}>${esc(option.label)}</option>`).join("")}</select></div>`}
function activeOptions(items,idKey,labelKey,selected){return items.filter(item=>item.aktif||item[idKey]===selected).map(item=>({value:item[idKey],label:item[labelKey]}))}

$("addSiswaBtn").onclick=()=>siswaForm();
function siswaForm(id=null){
  const student=state.siswa.find(item=>item.id_siswa===id);const fields=field("Nama siswa","fNama",student?.nama_siswa||"")+field("No. telepon","fTelepon",student?.no_telepon||"", "tel",false)+field("Email","fEmail",student?.email||"","email",false)+field("Tanggal daftar","fDaftar",student?.tanggal_daftar||todayISO(),"date")+`<div class="form-group"><label for="fAktif">Status siswa</label><select id="fAktif"><option value="true" ${student?.aktif!==false?"selected":""}>Aktif</option><option value="false" ${student?.aktif===false?"selected":""}>Nonaktif</option></select></div>`;
  openModal(modalForm(student?"Edit siswa":"Tambah siswa","Lengkapi informasi siswa kursus.",fields,"Simpan siswa"));
  $("recordForm").onsubmit=async event=>{event.preventDefault();await saveRecord("siswa",{nama_siswa:$("fNama").value.trim(),no_telepon:$("fTelepon").value.trim()||null,email:$("fEmail").value.trim()||null,tanggal_daftar:$("fDaftar").value,aktif:$("fAktif").value==="true"},"id_siswa",id)};
}
window.editSiswa=id=>siswaForm(id);
window.deleteSiswa=async id=>{if(!confirm("Hapus data siswa ini? Siswa yang memiliki tagihan tidak dapat dihapus."))return;const {error}=await supabaseClient.from("siswa").delete().eq("id_siswa",id);if(error)return toast("Siswa tidak dapat dihapus karena masih memiliki tagihan.");toast("Data siswa dihapus.");await loadAll()};

$("addProgramBtn").onclick=()=>programForm();
function programForm(id=null){
  const program=state.program.find(item=>item.id_program===id);const fields=field("Nama program","fNama",program?.nama_program||"")+field("Instrumen","fInstrumen",program?.instrumen||"")+field("Durasi per pertemuan (menit)","fDurasi",program?.durasi_menit||45,"number",true,'min="1" step="1"')+field("Biaya bulanan (Rp)","fBiaya",program?.biaya_bulanan||0,"number",true,'min="1" step="1"')+`<div class="form-group"><label for="fAktif">Status program</label><select id="fAktif"><option value="true" ${program?.aktif!==false?"selected":""}>Aktif</option><option value="false" ${program?.aktif===false?"selected":""}>Nonaktif</option></select></div>`;
  openModal(modalForm(program?"Edit program":"Tambah program","Atur instrumen dan biaya kursus per bulan.",fields,"Simpan program"));
  $("recordForm").onsubmit=async event=>{event.preventDefault();await saveRecord("program_kursus",{nama_program:$("fNama").value.trim(),instrumen:$("fInstrumen").value.trim(),durasi_menit:Number($("fDurasi").value),biaya_bulanan:Number($("fBiaya").value),aktif:$("fAktif").value==="true"},"id_program",id)};
}
window.editProgram=id=>programForm(id);
window.deleteProgram=async id=>{if(!confirm("Hapus program ini? Program yang sudah tercantum pada tagihan tidak dapat dihapus."))return;const {error}=await supabaseClient.from("program_kursus").delete().eq("id_program",id);if(error)return toast("Program tidak dapat dihapus karena masih digunakan.");toast("Program dihapus.");await loadAll()};

$("addTagihanBtn").onclick=()=>tagihanForm();
$("quickInvoice").onclick=()=>{showPage("tagihan");tagihanForm()};
function tagihanForm(id=null,selectedProgramId=null){
  if(!state.siswa.length||!state.program.length)return toast("Tambahkan data siswa dan program aktif terlebih dahulu.");
  const invoice=state.tagihan.find(item=>item.id_tagihan===id);const chosenProgramId=invoice?.id_program??selectedProgramId;const students=activeOptions(state.siswa,"id_siswa","nama_siswa",invoice?.id_siswa);const programs=activeOptions(state.program,"id_program","nama_program",chosenProgramId);
  const fields=selectField("Siswa","fSiswa",students,invoice?.id_siswa)+selectField("Program kursus","fProgram",programs,chosenProgramId)+field("Periode tagihan","fPeriode",invoice?.periode||new Date().toLocaleDateString("id-ID",{month:"long",year:"numeric"}))+field("Tanggal diterbitkan","fTerbit",invoice?.tanggal_terbit||todayISO(),"date")+field("Tanggal jatuh tempo","fTempo",invoice?.tanggal_jatuh_tempo||todayISO(),"date")+field("Jumlah tagihan (Rp)","fJumlah",invoice?.jumlah_tagihan||"","number",true,'min="1" step="1"')+field("Keterangan","fKeterangan",invoice?.keterangan||"", "text",false);
  openModal(modalForm(invoice?`Edit ${invoiceNumber(id)}`:"Buat tagihan","Jumlah pembayaran tidak boleh melebihi nilai tagihan.",fields,"Simpan tagihan"));
  $("fProgram").addEventListener("change",()=>{if(!invoice){const selected=state.program.find(item=>item.id_program===Number($("fProgram").value));$("fJumlah").value=selected?.biaya_bulanan||""}});
  if(!invoice){const selected=state.program.find(item=>item.id_program===Number($("fProgram").value));$("fJumlah").value=selected?.biaya_bulanan||""}
  $("recordForm").onsubmit=async event=>{event.preventDefault();const payload={id_siswa:Number($("fSiswa").value),id_program:Number($("fProgram").value),periode:$("fPeriode").value.trim(),tanggal_terbit:$("fTerbit").value,tanggal_jatuh_tempo:$("fTempo").value,jumlah_tagihan:Number($("fJumlah").value),keterangan:$("fKeterangan").value.trim()||null};await saveRecord("tagihan",payload,"id_tagihan",id)};
}
window.editTagihan=id=>tagihanForm(id);
window.deleteTagihan=async id=>{if(paidAmount(id)>0)return toast("Tagihan dengan pembayaran tidak dapat dihapus.");if(!confirm("Hapus tagihan ini?"))return;const {error}=await supabaseClient.from("tagihan").delete().eq("id_tagihan",id);if(error)return toast(error.message);toast("Tagihan dihapus.");await loadAll()};

$("addPembayaranBtn").onclick=()=>pembayaranForm();
$("quickPayment").onclick=()=>{showPage("pembayaran");pembayaranForm()};
function pembayaranForm(id=null){
  const payment=state.pembayaran.find(item=>item.id_pembayaran===id);const outstanding=state.tagihan.filter(invoice=>payment?invoice.id_tagihan===payment.id_tagihan:balance(invoice)>0);
  if(!outstanding.length)return toast("Belum ada tagihan dengan sisa pembayaran.");
  const invoiceOptions=outstanding.map(invoice=>({value:invoice.id_tagihan,label:`${invoiceNumber(invoice.id_tagihan)} · ${studentName(invoice.id_siswa)} · sisa ${rupiah(balance(invoice)+(payment?.id_tagihan===invoice.id_tagihan?Number(payment.jumlah_bayar):0))}`}));
  const fields=selectField("Tagihan","fTagihan",invoiceOptions,payment?.id_tagihan)+field("Tanggal pembayaran","fTanggal",payment?.tanggal_bayar||todayISO(),"date")+field("Jumlah pembayaran (Rp)","fJumlah",payment?.jumlah_bayar||"","number",true,'min="1" step="1"')+selectField("Metode pembayaran","fMetode",["Tunai","Transfer bank","QRIS","Lainnya"].map(value=>({value,label:value})),payment?.metode||"Transfer bank")+field("Nomor referensi (opsional)","fReferensi",payment?.referensi||"", "text",false);
  openModal(modalForm(payment?"Edit pembayaran":"Catat pembayaran","Pembayaran akan mengurangi saldo piutang secara otomatis.",fields,"Simpan pembayaran"));
  $("recordForm").onsubmit=async event=>{event.preventDefault();const invoiceId=Number($("fTagihan").value);const amount=Number($("fJumlah").value);const bill=state.tagihan.find(item=>item.id_tagihan===invoiceId);const available=balance(bill)+(payment?.id_tagihan===invoiceId?Number(payment.jumlah_bayar):0);if(amount>available)return toast(`Maksimal pembayaran untuk tagihan ini ${rupiah(available)}.`);const payload={id_tagihan:invoiceId,tanggal_bayar:$("fTanggal").value,jumlah_bayar:amount,metode:$("fMetode").value,referensi:$("fReferensi").value.trim()||null};const result=id?await supabaseClient.from("pembayaran").update(payload).eq("id_pembayaran",id).select().single():await supabaseClient.from("pembayaran").insert(payload).select().single();if(result.error)return toast(result.error.message);closeModal();await loadAll();if(!id)showPaymentReceipt(result.data)};
}
window.editPembayaran=id=>pembayaranForm(id);
window.deletePembayaran=async id=>{if(!confirm("Hapus pembayaran ini? Saldo piutang akan bertambah kembali."))return;const {error}=await supabaseClient.from("pembayaran").delete().eq("id_pembayaran",id);if(error)return toast(error.message);toast("Pembayaran dihapus; saldo piutang diperbarui.");await loadAll()};

restoreSettings();
restoreDashboardCache();
loadAll();

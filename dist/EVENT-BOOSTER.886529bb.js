let e;let t="mABh53dNd5AlUTxKtHvnFAxMeC8XhPO6",a="https://app.ticketmaster.com/discovery/v2";async function n({keyword:e="",countryCode:o="",page:s=0,size:d=12}={}){let r=new URLSearchParams({apikey:t,size:d,page:s,sort:"date,asc"});e&&r.append("keyword",e),o&&r.append("countryCode",o);let i=await fetch(`${a}/events.json?${r}`);if(!i.ok)throw Error(`API error: ${i.status}`);let l=await i.json();return{events:l._embedded?.events??[],totalPages:l.page?.totalPages??0,page:l.page?.number??0}}async function o(e){let n=new URLSearchParams({apikey:t}),o=await fetch(`${a}/events/${e}.json?${n}`);if(!o.ok)throw Error(`API error: ${o.status}`);return o.json()}async function s(e){let n=new URLSearchParams({apikey:t,attractionId:e,size:6,sort:"date,asc"}),o=await fetch(`${a}/events.json?${n}`);if(!o.ok)return[];let s=await o.json();return s._embedded?.events??[]}function d(e=[]){let t=e.filter(e=>"16_9"===e.ratio),a=t.length?t:e;return a.reduce((e,t)=>t.width>(e?.width??0)?t:e,null)?.url??""}function r(e,t=""){return e?new Date(`${e}T${t||"00:00:00"}`).toLocaleDateString("en-US",{weekday:"short",year:"numeric",month:"short",day:"numeric"}):"Date TBA"}function i(e){document.getElementById("skeletonGrid")?.classList.toggle("hidden",!e)}function l(e){document.getElementById("emptyState")?.classList.toggle("hidden",!e)}function c(e=""){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}let m={keyword:"",countryCode:"",page:0,totalPages:0,isLoading:!1,hasMore:!0},p=document.getElementById("searchInput"),u=document.getElementById("searchBtn"),g=document.getElementById("countrySelect"),v=document.getElementById("eventsGrid"),y=document.getElementById("modalOverlay"),_=document.getElementById("modal"),h=document.getElementById("modalContent"),$=document.getElementById("modalMore"),f=document.getElementById("modalClose"),L=document.createElement("div");L.id="sentinel",document.body.appendChild(L);let w=new IntersectionObserver(e=>{e[0].isIntersecting&&m.hasMore&&!m.isLoading&&E()},{rootMargin:"300px"});async function E(){m.page+=1,await b(!0)}async function b(e=!1){if(!m.isLoading){w.unobserve(L),m.isLoading=!0,i(!0),l(!1),e||(v.innerHTML="");try{let{events:t,totalPages:a,page:o}=await n({keyword:m.keyword,countryCode:m.countryCode,page:m.page,size:12});if(m.totalPages=a,m.page=o,m.hasMore=o<a-1,!t.length&&!e)return void l(!0);!function(e,t,a,n=!1){n||(t.innerHTML=""),e.forEach((e,n)=>{let o=document.createElement("div");o.className="event-card";let s=d(e.images),i=r(e.dates?.start?.localDate,e.dates?.start?.localTime),l=e._embedded?.venues?.[0];o.innerHTML=`
      ${s?`<img class="event-card__img" src="${s}" alt="${c(e.name)}" loading="lazy" />`:'<div class="event-card__img"></div>'}
      <div class="event-card__body">
        <p class="event-card__name">${c(e.name)}</p>
        <p class="event-card__date">${i}</p>
        ${l?`<p class="event-card__venue">${c(l.name)}${l.city?.name?", "+c(l.city.name):""}</p>`:""}
      </div>
    `,o.addEventListener("click",()=>a(e)),t.appendChild(o)})}(t,v,I,e),m.hasMore&&w.observe(L)}catch(t){e||l(!0),console.error(t)}finally{i(!1),m.isLoading=!1}}}function k(){w.unobserve(L),m.keyword=p.value.trim(),m.countryCode=g.value,m.page=0,m.hasMore=!0,b(!1)}async function I(e){h.innerHTML='<p style="padding:40px;text-align:center;color:#888">Loading...</p>',$.innerHTML="",y.classList.remove("hidden"),document.body.style.overflow="hidden";try{let t,a,n,i,l,m,[p,u]=await Promise.all([o(e.id),e._embedded?.attractions?.[0]?.id?s(e._embedded.attractions[0].id):Promise.resolve([])]);t=d(p.images),a=r(p.dates?.start?.localDate,p.dates?.start?.localTime),n=p._embedded?.venues?.[0],i=p._embedded?.attractions??[],(l=document.getElementById("modalAvatar"))&&(t?(l.src=t,l.classList.add("visible")):l.classList.remove("visible")),h.innerHTML=`
    ${t?`<img class="modal__img" src="${t}" alt="${c(p.name)}" />`:""}
    <div class="modal__info">
      <h2 class="modal__title">${c(p.name)}</h2>

      ${p.info?`
        <p class="modal__section-label">Info</p>
        <p class="modal__section-value">${c(p.info)}</p>
      `:""}

      <p class="modal__section-label">When</p>
      <p class="modal__section-value">${a}</p>

      ${n?`
        <p class="modal__section-label">Where</p>
        <p class="modal__section-value">${c(n.name)}${n.city?.name?", "+c(n.city.name):""}</p>
      `:""}

      ${i[0]?.name?`
        <p class="modal__section-label">Who</p>
        <p class="modal__section-value">${c(i[0].name)}</p>
      `:""}

      ${p.priceRanges?.[0]?`
        <p class="modal__section-label">Prices</p>
        <p class="modal__section-value">${p.priceRanges[0].min}\u{2013}${p.priceRanges[0].max} ${p.priceRanges[0].currency??""}</p>
      `:""}

      ${p.url?`<a class="modal__buy-btn" href="${p.url}" target="_blank" rel="noopener">Buy Tickets</a>`:""}
    </div>
  `,(m=u.filter(e=>e.id!==p.id).slice(0,3)).length?$.innerHTML=`
      <p class="modal__more-title">More from ${i[0]?.name??"this artist"}</p>
      <div class="modal__more-grid">
        ${m.map(e=>`
          <div class="more-card" data-id="${e.id}">
            ${d(e.images)?`<img class="more-card__img" src="${d(e.images)}" alt="${c(e.name)}" loading="lazy" />`:'<div class="more-card__img"></div>'}
            <p class="more-card__name">${c(e.name)}</p>
          </div>
        `).join("")}
      </div>
    `:$.innerHTML="",$.querySelectorAll(".more-card").forEach((e,t)=>{e.addEventListener("click",()=>I(u[t]))})}catch(e){h.innerHTML='<p style="padding:40px;text-align:center;color:#888">Failed to load.</p>',console.error(e)}}function T(){y.classList.add("hidden"),document.body.style.overflow="",_.scrollTop=0}u.addEventListener("click",k),p.addEventListener("keydown",e=>{"Enter"===e.key&&k()}),p.addEventListener("input",()=>{clearTimeout(e),e=setTimeout(k,500)}),g.addEventListener("change",()=>{w.unobserve(L),m.countryCode=g.value,m.page=0,m.hasMore=!0,b(!1)}),f.addEventListener("click",T),y.addEventListener("click",e=>{e.target===y&&T()}),document.addEventListener("keydown",e=>{"Escape"===e.key&&T()}),b(!1),function(){let e=document.getElementById("scrollTopBtn");if(!e)return;let t=()=>{e.classList.toggle("visible",window.scrollY>400)};window.addEventListener("scroll",t,{passive:!0}),e.addEventListener("click",()=>{window.scrollTo({top:0,behavior:"smooth"})}),t()}();
//# sourceMappingURL=EVENT-BOOSTER.886529bb.js.map

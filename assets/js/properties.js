
async function loadDLCAOData(file){
  try{
    const res = await fetch(file);
    return await res.json();
  }catch(e){
    console.warn("DLCAO data not loaded:", file, e);
    return [];
  }
}

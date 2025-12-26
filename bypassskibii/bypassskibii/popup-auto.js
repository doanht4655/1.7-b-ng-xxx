(function () {
  const apiKeys = [
    "ducknotoilet-3de65a49-6a6b-23db-0f1f-e5c21f9e55b8",
    "hieugamingmc-0a2cc0bf-20cc-01fa-be3c-d39dedc52470",
    "alexanderace-7bf11673-16ad-4df0-25a9-c3c99627934b",
    "skibiditoiii-fa1116f6-8e93-55cd-2640-9e42c3bf95b3",
    "sigmaskibidi-0c7c460b-9ecc-6502-c000-342c3bdd42f4",
	"nomyskibidi-fbffb91b-0da6-9736-21dc-5e2162bcd26e"
  ];

  // Lấy 1 API key ngẫu nhiên
  const getRandomApiKey = () => {
    const index = Math.floor(Math.random() * apiKeys.length);
    return apiKeys[index];
  };

  window.addEventListener("load", () => {
    const hasReloaded = localStorage.getItem("popupAutoReloaded");

    const waitForInput = () => {
      const input = document.querySelector('input[type="text"][placeholder="Enter your API key"]');
      if (input) {
        const randomKey = getRandomApiKey();
        input.focus();
        input.value = randomKey;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        console.log("✅ Đã nhập key ngẫu nhiên:", randomKey);

        // Reset flag reload sau khi đã nhập
        localStorage.removeItem("popupAutoReloaded");
      } else {
        setTimeout(waitForInput, 300);
      }
    };

    if (!hasReloaded) {
      localStorage.setItem("popupAutoReloaded", "true");
      console.log("🔁 Reload lần đầu...");
      location.reload();
    } else {
      waitForInput();
    }
  });
})();

const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Инициализация Supabase клиента
const supabase = createClient(
  'https://ypfoeackdeyzkmrkytwz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

// Инициализация Discord клиента
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Список администраторов из .env
const adminIds = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',').map(id => id.trim()) : [];

// Генерация ключа
function generateKey(isHwidKey = false) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  const length = isHwidKey ? 8 : 16;
  for (let i = 0; i < length; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
    if (isHwidKey && i === 3) key += '-';
    else if (!isHwidKey && i % 4 === 3 && i < 15) key += '-';
  }
  return key;
}

// Хеширование ключа
async function sha256(str) {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Создание embed
function createEmbed(title, description, color = '#8a00d4') {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: 'Pasta.xyz KeyGen', iconURL: client.user.displayAvatarURL() });
}

// Обработчик готовности бота
client.once('ready', () => {
  console.log(`🚀 Бот ${client.user.tag} готов!`);
});

// Обработчик команд
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'generatekey') {
    if (!adminIds.includes(message.author.id)) {
      return message.reply({
        embeds: [createEmbed('⛔ Ошибка', 'Только админы могут генерить ключи!', '#e63946')],
        ephemeral: true,
      });
    }

    const typeMenu = new StringSelectMenuBuilder()
      .setCustomId('key_type')
      .setPlaceholder('Выберите тип ключа')
      .addOptions(
        { label: 'Обычный ключ', value: 'key' },
        { label: 'HWID ключ', value: 'hwid' }
      );

    const row = new ActionRowBuilder().addComponents(typeMenu);

    await message.reply({
      embeds: [createEmbed('🔑 Генерация ключа', 'Выберите тип ключа:\nТип: Не выбрано')],
      components: [row],
      ephemeral: true,
    });
  }
});

// Обработчик взаимодействий
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

  if (!adminIds.includes(interaction.user.id)) {
    return interaction.reply({
      embeds: [createEmbed('⛔ Ошибка', 'Только админы могут это делать!', '#e63946')],
      ephemeral: true,
    });
  }

  let embed = EmbedBuilder.from(interaction.message.embeds[0]);
  let currentDescription = embed.data.description || '';

  if (interaction.isStringSelectMenu()) {
    const { customId, values } = interaction;
    const value = values[0];

    console.log(`[DEBUG] Выбрано: customId=${customId}, value=${value}`);

    if (customId === 'key_type') {
      let components = [];
      if (value === 'key') {
        const accessMenu = new StringSelectMenuBuilder()
          .setCustomId('access_level')
          .setPlaceholder('Выберите уровень доступа')
          .addOptions(
            { label: 'Уровень 1', value: '1' },
            { label: 'Уровень 2', value: '2' },
            { label: 'Уровень 3', value: '3' }
          );

        const limitMenu = new StringSelectMenuBuilder()
          .setCustomId('activation_limit')
          .setPlaceholder('Выберите лимит активаций')
          .addOptions(
            { label: '1 активация', value: '1' },
            { label: '5 активаций', value: '5' },
            { label: '10 активаций', value: '10' }
          );

        const daysMenu = new StringSelectMenuBuilder()
          .setCustomId('days_valid')
          .setPlaceholder('Выберите срок действия')
          .addOptions(
            { label: '7 дней', value: '7' },
            { label: '14 дней', value: '14' },
            { label: '30 дней', value: '30' }
          );

        const generateButton = new ButtonBuilder()
          .setCustomId('generate_key')
          .setLabel('🎁 Сгенерировать')
          .setStyle(ButtonStyle.Success);

        components = [
          new ActionRowBuilder().addComponents(accessMenu),
          new ActionRowBuilder().addComponents(limitMenu),
          new ActionRowBuilder().addComponents(daysMenu),
          new ActionRowBuilder().addComponents(generateButton),
        ];
        currentDescription = 'Выберите параметры ключа:\nТип: Обычный\nУровень: Не выбрано\nАктивации: Не выбрано\nСрок: Не выбрано';
      } else if (value === 'hwid') {
        const daysMenu = new StringSelectMenuBuilder()
          .setCustomId('days_valid_hwid')
          .setPlaceholder('Выберите срок действия')
          .addOptions(
            { label: '7 дней', value: '7' },
            { label: '14 дней', value: '14' },
            { label: '30 дней', value: '30' }
          );

        const generateButton = new ButtonBuilder()
          .setCustomId('generate_hwid')
          .setLabel('🎁 Сгенерировать HWID ключ')
          .setStyle(ButtonStyle.Success);

        components = [
          new ActionRowBuilder().addComponents(daysMenu),
          new ActionRowBuilder().addComponents(generateButton),
        ];
        currentDescription = 'Выберите параметры ключа:\nТип: HWID\nСрок: Не выбрано';
      }

      embed.setDescription(currentDescription);
      await interaction.update({ embeds: [embed], components, ephemeral: true });
    } else if (customId === 'access_level' || customId === 'activation_limit' || customId === 'days_valid' || customId === 'days_valid_hwid') {
      let lines = currentDescription.split('\n');
      if (customId === 'access_level') {
        lines[2] = `Уровень: ${value}`;
      } else if (customId === 'activation_limit') {
        lines[3] = `Активации: ${value}`;
      } else if (customId === 'days_valid') {
        lines[4] = `Срок: ${value} дней`;
      } else if (customId === 'days_valid_hwid') {
        lines[2] = `Срок: ${value} дней`;
      }

      currentDescription = lines.join('\n');
      console.log(`[DEBUG] Обновлено: ${currentDescription}`);

      embed.setDescription(currentDescription);
      await interaction.update({ embeds: [embed], components: interaction.message.components, ephemeral: true });
    }
  } else if (interaction.isButton()) {
    console.log(`[DEBUG] Кнопка: ${interaction.customId}, Текст: ${currentDescription}`);

    if (interaction.customId === 'generate_key') {
      const accessLevelMatch = currentDescription.match(/Уровень: (\d+)/);
      const activationLimitMatch = currentDescription.match(/Активации: (\d+)/);
      const daysValidMatch = currentDescription.match(/Срок: (\d+) дней/);

      const accessLevel = accessLevelMatch ? parseInt(accessLevelMatch[1]) : null;
      const activationLimit = activationLimitMatch ? parseInt(activationLimitMatch[1]) : null;
      const daysValid = daysValidMatch ? parseInt(daysValidMatch[1]) : null;

      if (!accessLevel || !activationLimit || !daysValid) {
        return interaction.update({
          embeds: [createEmbed('⛔ Ошибка', 'Выбери все параметры (уровень, активации, срок)!', '#e63946')],
          components: interaction.message.components,
          ephemeral: true,
        });
      }

      await generateAndSaveKey(interaction, accessLevel, activationLimit, daysValid, false);
    } else if (interaction.customId === 'generate_hwid') {
      const daysValidMatch = currentDescription.match(/Срок: (\d+) дней/);
      const daysValid = daysValidMatch ? parseInt(daysValidMatch[1]) : null;

      if (!daysValid) {
        return interaction.update({
          embeds: [createEmbed('⛔ Ошибка', 'Выбери срок действия!', '#e63946')],
          components: interaction.message.components,
          ephemeral: true,
        });
      }

      await generateAndSaveKey(interaction, null, 1, daysValid, true);
    }
  }
});

// Функция генерации и сохранения ключа
async function generateAndSaveKey(interaction, accessLevel, activationLimit, daysValid, isHwidKey) {
  const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString();

  try {
    const key = generateKey(isHwidKey);
    const keyHash = await sha256(key);

    const table = isHwidKey ? 'hwid_reset_keys' : 'keyz';
    const keyData = {
      key_hash: keyHash,
      activation_limit: activationLimit,
      activation_count: 0,
      expires_at: expiresAt,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    if (!isHwidKey) {
      keyData.access_level = accessLevel;
    }

    console.log(`[DEBUG] Ключ: ${key}, Хэш: ${keyHash}, Данные:`, keyData);

    const { error } = await supabase.from(table).insert([keyData]);

    if (error) {
      console.error('[ERROR] Supabase:', JSON.stringify(error, null, 2));
      return interaction.update({
        embeds: [createEmbed('⛔ Ошибка', `Ошибка сохранения ключа: ${error.message || 'Неизвестная ошибка'}`, '#e63946')],
        components: [],
        ephemeral: true,
      });
    }

    const title = isHwidKey ? '🔑 HWID ключ готов!' : '🔑 Ключ готов!';
    const description = isHwidKey
      ? `**Ключ**: \`${key}\`\n**Лимит**: ${activationLimit}\n**Истекает**: ${expiresAt}`
      : `**Ключ**: \`${key}\`\n**Уровень**: ${accessLevel}\n**Лимит**: ${activationLimit}\n**Истекает**: ${expiresAt}`;
    const embed = createEmbed(title, description);
    await interaction.update({ embeds: [embed], components: [], ephemeral: true });
  } catch (err) {
    console.error('[ERROR] Сервер:', err.message, err.stack);
    await interaction.update({
      embeds: [createEmbed('⛔ Ошибка', 'Ошибка сервера!', '#e63946')],
      components: [],
      ephemeral: true,
    });
  }
}

// Запуск бота
client.login(process.env.DISCORD_TOKEN);
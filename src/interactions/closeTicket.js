const {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionsBitField,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "close_ticket",
  /**
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(client, config, interaction) {
    try {
      const [, , roleID] = interaction.customId.split("_");
      await interaction.deferReply({});
      await interaction.channel.permissionOverwrites.set([
        {
          id: interaction.guildId,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.channel.topic,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: roleID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ]);
      // Embed message confirming ticket closure
      const embed = new EmbedBuilder()
        .setColor("#ff5555")
        .setTitle("تم إغلاق التذكرة")
        .setDescription(
          "تم إغلاق هذه التذكرة. انقر على الزر أدناه إذا كنت ترغب في حذف هذه التذكرة."
        );

      // Button to confirm ticket deletion
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("delete_ticket")
          .setLabel("حذف التذكرة")
          .setStyle(ButtonStyle.Secondary)
      );
      interaction.message.components[0].components[0].data.disabled = true;
      interaction.message.components[0].components[1].data.disabled = true;
      interaction.message.edit({ components: interaction.message.components });
      // Send embed and button
      await interaction.editReply({ embeds: [embed], components: [row] });
      const user = await interaction.guild.members
        .fetch(interaction.channel.topic)
        .catch(() => {});
      // Create an embed with information about the closed ticket
      const userEmbed = new EmbedBuilder()
        .setTitle("تم اغلاق تذكرتك")
        .setColor("#05131f")
        .addFields(
          {
            name: "فتح التذكرة",
            value: `<@${interaction.channel.topic}>`,
            inline: true,
          },
          {
            name: "اغلق التذكرة",
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
          {
            name: "وقت فتح التذكرة",
            value: new Date(
              interaction.channel.createdTimestamp
            ).toLocaleString(),
            inline: true,
          },
          {
            name: "وقت اغلاق التذكرة",
            value: new Date().toLocaleString(),
            inline: true,
          }
        );
      if (user) user.send({ embeds: [userEmbed] });
    } catch (error) {
      console.log(error);
      await interaction.editReply({
        content: "حدث خطأ أثناء إغلاق التذكرة.",
        ephemeral: true,
      });
    }
  },
};

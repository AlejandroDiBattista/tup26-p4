#:package Terminal.Gui@2.0.1
#:property PublishAot=false

#nullable enable

using System.Collections.ObjectModel;
using System.Globalization;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using Terminal.Gui.App;
using Terminal.Gui.Drawing;
using Terminal.Gui.Input;
using Terminal.Gui.ViewBase;
using Terminal.Gui.Views;

Console.OutputEncoding = Encoding.UTF8;

string dataFile = args.Length > 0
    ? Path.GetFullPath(args[0])
    : Path.Combine(SourceDirectory(), "agenda-terminal-gui.json");

JsonAgendaStore store = new(dataFile);

using IApplication app = Application.Create().Init();
app.Run(new AgendaWindow(store));

static string SourceDirectory([CallerFilePath] string sourcePath = "") {
    return Path.GetDirectoryName(sourcePath) ?? Directory.GetCurrentDirectory();
}

public sealed class AgendaWindow : Runnable {
    private readonly JsonAgendaStore store;
    private readonly TextField searchField = new();
    private readonly CheckBox favoritesOnly = new();
    private readonly ListView contactsList = new();
    private readonly Label detailsLabel = new();
    private readonly Label statusLabel = new();

    private List<Contacto> contacts = new();
    private List<Contacto> filteredContacts = new();
    private bool hasUnsavedChanges;

    public AgendaWindow(JsonAgendaStore store) {
        this.store = store;

        Title = "Agenda - Terminal.Gui";
        Width = Dim.Fill();
        Height = Dim.Fill();

        Menu.DefaultBorderStyle = LineStyle.Single;

        BuildLayout();
        LoadContacts();
        searchField.SetFocus();
    }

    private void BuildLayout() {
        MenuBar menu = new() {
            Menus = [
                new MenuBarItem("_Archivo", [
                    new MenuItem("_Guardar", "Ctrl+S", SaveContacts),
                    null!,
                    new MenuItem("_Importar JSON...", "Ctrl+I", ImportFromJson),
                    new MenuItem("_Exportar JSON...", "Ctrl+E", ExportToJson),
                    new MenuItem("_Recargar", "Ctrl+R", ReloadContacts),
                    null!,
                    new MenuItem("_Salir", "Ctrl+Q", RequestExit)
                ]),
                new MenuBarItem("_Contactos", [
                    new MenuItem("_Nuevo", "F2 / Ctrl+N", NewContact),
                    new MenuItem("_Editar", "Enter / F3", EditSelectedContact),
                    new MenuItem("_Eliminar", "Del", DeleteSelectedContact)
                ]),
                new MenuBarItem("A_yuda", [
                    new MenuItem("_Acerca de", "Información", ShowAbout)
                ])
            ]
        };

        Label searchLabel = new() {
            Text = "Buscar:",
            X = 1,
            Y = 2
        };

        searchField.X = Pos.Right(searchLabel) + 1;
        searchField.Y = Pos.Top(searchLabel);
        searchField.Width = Dim.Percent(42);
        searchField.ValueChanged += (_, _) => RefreshContacts();

        favoritesOnly.Text = "Solo _favoritos";
        favoritesOnly.X = Pos.Right(searchField) + 2;
        favoritesOnly.Y = Pos.Top(searchField);
        favoritesOnly.ValueChanged += (_, _) => RefreshContacts();

        Button newButton = new() {
            Text = "Nuevo",
            X = 1,
            Y = Pos.Bottom(searchField) + 1
        };
        newButton.Accepted += (_, _) => NewContact();

        Button editButton = new() {
            Text = "Editar",
            X = Pos.Right(newButton) + 1,
            Y = Pos.Top(newButton)
        };
        editButton.Accepted += (_, _) => EditSelectedContact();

        Button deleteButton = new() {
            Text = "Eliminar",
            X = Pos.Right(editButton) + 1,
            Y = Pos.Top(newButton)
        };
        deleteButton.Accepted += (_, _) => DeleteSelectedContact();

        FrameView listPanel = new() {
            Title = "Contactos",
            X = 0,
            Y = 5,
            Width = Dim.Percent(38),
            Height = Dim.Fill(2)
        };
        listPanel.BorderStyle = LineStyle.Single;

        contactsList.X = 0;
        contactsList.Y = 0;
        contactsList.Width = Dim.Fill();
        contactsList.Height = Dim.Fill();
        contactsList.ValueChanged += (_, _) => RefreshDetails();
        contactsList.Accepted += (_, _) => EditSelectedContact();
        listPanel.Add(contactsList);

        FrameView detailsPanel = new() {
            Title = "Detalle",
            X = Pos.Right(listPanel),
            Y = Pos.Top(listPanel),
            Width = Dim.Fill(),
            Height = Dim.Fill(2)
        };
        detailsPanel.BorderStyle = LineStyle.Single;

        detailsLabel.X = 1;
        detailsLabel.Y = 0;
        detailsLabel.Width = Dim.Fill(1);
        detailsLabel.Height = Dim.Fill();
        detailsPanel.Add(detailsLabel);

        statusLabel.X = 1;
        statusLabel.Y = Pos.AnchorEnd(1);
        statusLabel.Width = Dim.Fill();

        Add(
            menu,
            searchLabel, searchField, favoritesOnly,
            newButton, editButton, deleteButton,
            listPanel,
            detailsPanel,
            statusLabel
        );
    }

    protected override bool OnKeyDown(Key key) {
        switch (key) {
            case var _ when key == Key.F2 || key == Key.N.WithCtrl:
                NewContact();
                return true;

            case var _ when key == Key.F3 || (key == Key.Enter && contactsList.HasFocus):
                EditSelectedContact();
                return true;

            case var _ when key == Key.Delete || key == Key.D.WithCtrl:
                DeleteSelectedContact();
                return true;

            case var _ when key == Key.S.WithCtrl:
                SaveContacts();
                return true;

            case var _ when key == Key.I.WithCtrl:
                ImportFromJson();
                return true;

            case var _ when key == Key.E.WithCtrl:
                ExportToJson();
                return true;

            case var _ when key == Key.R.WithCtrl:
                ReloadContacts();
                return true;

            case var _ when key == Key.Q.WithCtrl:
                RequestExit();
                return true;

            case var _ when key == Key.F4:
                searchField.SetFocus();
                return true;

            default:
                return base.OnKeyDown(key);
        }
    }

    private void LoadContacts() {
        contacts = store.Load();
        hasUnsavedChanges = false;
        RefreshContacts();
        SetStatus($"Datos cargados desde {System.IO.Path.GetFileName(store.Path)}.");
    }

    private void ReloadContacts() {
        if (hasUnsavedChanges) {
            int answer = MessageBox.Query(
                App!,
                "Recargar",
                "Hay cambios sin guardar. ¿Descartarlos y leer otra vez el JSON?",
                "No",
                "Sí") ?? 0;

            if (answer != 1) {
                return;
            }
        }

        LoadContacts();
    }

    private void SaveContacts() {
        store.Save(contacts);
        hasUnsavedChanges = false;
        RefreshStatus();
        SetStatus($"Guardado en {System.IO.Path.GetFileName(store.Path)}.");
    }

    private void ImportFromJson() {
        string? path = AskFilePath(
            "Importar JSON",
            "Ruta del archivo a importar:",
            DefaultJsonPath("agenda.json"));

        if (string.IsNullOrWhiteSpace(path)) {
            return;
        }

        path = System.IO.Path.GetFullPath(path);

        if (!File.Exists(path)) {
            MessageBox.Query(App!, "Importar JSON", $"No existe el archivo:\n{path}", "OK");
            return;
        }

        try {
            List<Contacto> imported = new JsonAgendaStore(path).Load();

            int answer = MessageBox.Query(
                App!,
                "Importar JSON",
                $"Se reemplazarán los {contacts.Count} contactos actuales por {imported.Count} contactos importados. ¿Continuar?",
                "No",
                "Sí") ?? 0;

            if (answer != 1) {
                return;
            }

            contacts = NormalizeImportedContacts(imported);
            hasUnsavedChanges = true;
            RefreshContacts();
            SetStatus($"Importados {contacts.Count} contactos desde {System.IO.Path.GetFileName(path)}. Guardá para persistirlos en la agenda principal.");
        } catch (Exception ex) {
            MessageBox.Query(App!, "Importar JSON", $"No se pudo importar el archivo:\n{ex.Message}", "OK");
        }
    }

    private void ExportToJson() {
        string? path = AskFilePath(
            "Exportar JSON",
            "Ruta del archivo de salida:",
            DefaultJsonPath("agenda.json"));

        if (string.IsNullOrWhiteSpace(path)) {
            return;
        }

        path = System.IO.Path.GetFullPath(path);

        try {
            new JsonAgendaStore(path).Save(contacts);
            SetStatus($"Exportados {contacts.Count} contactos a {System.IO.Path.GetFileName(path)}.");
        } catch (Exception ex) {
            MessageBox.Query(App!, "Exportar JSON", $"No se pudo exportar el archivo:\n{ex.Message}", "OK");
        }
    }

    private string? AskFilePath(string title, string prompt, string defaultPath) {
        Dialog dialog = new() {
            Title = title,
            Width = 72,
            Height = 9
        };

        Label label = new() {
            Text = prompt,
            X = 1,
            Y = 1
        };

        TextField input = new() {
            Text = defaultPath,
            X = 1,
            Y = Pos.Bottom(label) + 1,
            Width = Dim.Fill(2)
        };

        string? result = null;

        Button okButton = new() {
            Text = "Aceptar",
            IsDefault = true,
            X = 20,
            Y = 5
        };
        okButton.Accepting += (_, e) => {
            result = input.Text?.ToString()?.Trim();
            e.Handled = true;
            App!.RequestStop();
        };

        Button cancelButton = new() {
            Text = "Cancelar",
            X = Pos.Right(okButton) + 2,
            Y = Pos.Top(okButton)
        };
        cancelButton.Accepting += (_, e) => {
            result = null;
            e.Handled = true;
            App!.RequestStop();
        };

        dialog.Add(label, input, okButton, cancelButton);
        input.SetFocus();

        App!.Run(dialog);
        return result;
    }

    private void NewContact() {
        Contacto contact = new() {
            Id = NextId(),
            Nombre = "",
            Apellido = "",
            Telefono = "",
            Email = "",
            Ciudad = "",
            FechaNacimiento = null,
            Favorito = false,
            Notas = ""
        };

        ContactDialog dialog = new("Nuevo contacto", contact);
        App!.Run(dialog);

        if (!dialog.Saved || dialog.Contact is null) {
            return;
        }

        contacts.Add(dialog.Contact);
        MarkDirty("Contacto creado.");
        RefreshContacts(dialog.Contact.Id);
    }

    private void EditSelectedContact() {
        Contacto? selected = GetSelectedContact();
        if (selected is null) {
            MessageBox.Query(App!, "Editar", "Seleccioná un contacto.", "OK");
            return;
        }

        ContactDialog dialog = new("Editar contacto", selected.Clone());
        App!.Run(dialog);

        if (!dialog.Saved || dialog.Contact is null) {
            return;
        }

        int index = contacts.FindIndex(contact => contact.Id == selected.Id);
        if (index < 0) {
            return;
        }

        contacts[index] = dialog.Contact;
        MarkDirty("Contacto actualizado.");
        RefreshContacts(dialog.Contact.Id);
    }

    private void DeleteSelectedContact() {
        Contacto? selected = GetSelectedContact();
        if (selected is null) {
            MessageBox.Query(App!, "Eliminar", "Seleccioná un contacto.", "OK");
            return;
        }

        int answer = MessageBox.Query(
            App!,
            "Eliminar contacto",
            $"¿Eliminar a {selected.Apellido}, {selected.Nombre}?",
            "No",
            "Sí") ?? 0;

        if (answer != 1) {
            return;
        }

        contacts.RemoveAll(contact => contact.Id == selected.Id);
        MarkDirty("Contacto eliminado.");
        RefreshContacts();
    }

    private void RequestExit() {
        if (!hasUnsavedChanges) {
            App!.RequestStop();
            return;
        }

        int answer = MessageBox.Query(
            App!,
            "Salir",
            "Hay cambios sin guardar.",
            "Cancelar",
            "Salir sin guardar",
            "Guardar y salir") ?? 0;

        if (answer == 1) {
            App!.RequestStop();
        }
        else if (answer == 2) {
            SaveContacts();
            App!.RequestStop();
        }
    }

    private void ShowAbout() {
        MessageBox.Query(
            App!,
            "Agenda",
            "Agenda CRUD con Terminal.Gui.\n\nF2: nuevo\nF3/Enter: editar\nDel: eliminar\nCtrl+S: guardar\nCtrl+I: importar JSON\nCtrl+E: exportar JSON\nCtrl+Q: salir",
            "OK");
    }

    private void RefreshContacts(int? selectedId = null) {
        int? idToKeep = selectedId ?? GetSelectedContact()?.Id;
        string search = searchField.Text?.ToString()?.Trim() ?? "";
        bool onlyFavorites = favoritesOnly.Value == CheckState.Checked;

        filteredContacts = contacts
            .Where(contact => Matches(contact, search, onlyFavorites))
            .OrderByDescending(contact => contact.Favorito)
            .ThenBy(contact => contact.Apellido)
            .ThenBy(contact => contact.Nombre)
            .ToList();

        contactsList.SetSource(ToObservable(filteredContacts.Select(FormatMasterRow)));

        if (filteredContacts.Count == 0) {
            contactsList.SelectedItem = null;
            RefreshDetails();
            RefreshStatus();
            return;
        }

        int index = idToKeep is null
            ? 0
            : filteredContacts.FindIndex(contact => contact.Id == idToKeep.Value);

        if (index < 0) {
            index = 0;
        }

        contactsList.SelectedItem = index;
        RefreshDetails();
        RefreshStatus();
    }

    private void RefreshDetails() {
        Contacto? selected = GetSelectedContact();

        if (selected is null) {
            detailsLabel.Text = "Sin contacto seleccionado.";
            return;
        }

        string birthDate = selected.FechaNacimiento is null
            ? "Sin cargar"
            : selected.FechaNacimiento.Value.ToString("yyyy-MM-dd");

        string notes = string.IsNullOrWhiteSpace(selected.Notas)
            ? "Sin notas."
            : selected.Notas;

        detailsLabel.Text = $"""
            Apellido:   {selected.Apellido}
            Nombre:     {selected.Nombre}
            Teléfono:   {selected.Telefono}
            Email:      {selected.Email}
            Ciudad:     {selected.Ciudad}
            Nacimiento: {birthDate}
            Favorito:   {(selected.Favorito ? "Sí" : "No")}

            Notas:
            {notes}
            """;
    }

    private void RefreshStatus() {
        string dirty = hasUnsavedChanges ? "Cambios sin guardar." : "Sin cambios pendientes.";
        statusLabel.Text = $"{filteredContacts.Count} de {contacts.Count} contactos. {dirty} F2 Nuevo | F3 Editar | Del Eliminar | Ctrl+S Guardar | Ctrl+I Importar | Ctrl+E Exportar | Ctrl+Q Salir";
    }

    private void SetStatus(string message) {
        RefreshStatus();
        statusLabel.Text = $"{message} {statusLabel.Text}";
    }

    private void MarkDirty(string message) {
        hasUnsavedChanges = true;
        SetStatus(message);
    }

    private Contacto? GetSelectedContact() {
        int index = contactsList.SelectedItem ?? -1;
        return index >= 0 && index < filteredContacts.Count
            ? filteredContacts[index]
            : null;
    }

    private int NextId() {
        return contacts.Count == 0 ? 1 : contacts.Max(contact => contact.Id) + 1;
    }

    private string DefaultJsonPath(string fileName) {
        string directory = System.IO.Path.GetDirectoryName(store.Path) ?? Directory.GetCurrentDirectory();
        return System.IO.Path.Combine(directory, fileName);
    }

    private static List<Contacto> NormalizeImportedContacts(List<Contacto> imported) {
        HashSet<int> usedIds = new();
        int nextId = 1;

        foreach (Contacto contact in imported) {
            if (contact.Id <= 0 || !usedIds.Add(contact.Id)) {
                while (usedIds.Contains(nextId)) {
                    nextId++;
                }

                contact.Id = nextId;
                usedIds.Add(contact.Id);
            }

            nextId = Math.Max(nextId, contact.Id + 1);
        }

        return imported;
    }

    private static bool Matches(Contacto contact, string search, bool onlyFavorites) {
        if (onlyFavorites && !contact.Favorito) {
            return false;
        }

        if (string.IsNullOrWhiteSpace(search)) {
            return true;
        }

        return Contains(contact.Apellido, search)
            || Contains(contact.Nombre, search)
            || Contains(contact.Telefono, search)
            || Contains(contact.Email, search)
            || Contains(contact.Ciudad, search)
            || Contains(contact.Notas, search);
    }

    private static bool Contains(string value, string search) {
        return value.Contains(search, StringComparison.OrdinalIgnoreCase);
    }

    private static string FormatMasterRow(Contacto contact) {
        return $"{contact.Apellido}, {contact.Nombre}";
    }

    private static ObservableCollection<string> ToObservable(IEnumerable<string> values) {
        return new ObservableCollection<string>(values.ToList());
    }
}

public sealed class ContactDialog : Dialog {
    private readonly TextField nameField;
    private readonly TextField lastNameField;
    private readonly TextField phoneField;
    private readonly TextField emailField;
    private readonly TextField cityField;
    private readonly TextField birthDateField;
    private readonly CheckBox favoriteField;
    private readonly TextView notesField;

    public ContactDialog(string title, Contacto contact) {
        Contact = contact;
        Title = title;
        Width = 76;
        Height = 24;

        Label nameLabel = new() { Text = "Nombre:", X = 2, Y = 1 };
        nameField = new TextField {
            Text = contact.Nombre,
            X = 16,
            Y = Pos.Top(nameLabel),
            Width = Dim.Fill(2)
        };

        Label lastNameLabel = new() {
            Text = "Apellido:",
            X = Pos.Left(nameLabel),
            Y = Pos.Bottom(nameLabel) + 1
        };
        lastNameField = new TextField {
            Text = contact.Apellido,
            X = Pos.Left(nameField),
            Y = Pos.Top(lastNameLabel),
            Width = Dim.Fill(2)
        };

        Label phoneLabel = new() {
            Text = "Teléfono:",
            X = Pos.Left(nameLabel),
            Y = Pos.Bottom(lastNameLabel) + 1
        };
        phoneField = new TextField {
            Text = contact.Telefono,
            X = Pos.Left(nameField),
            Y = Pos.Top(phoneLabel),
            Width = Dim.Fill(2)
        };

        Label emailLabel = new() {
            Text = "Email:",
            X = Pos.Left(nameLabel),
            Y = Pos.Bottom(phoneLabel) + 1
        };
        emailField = new TextField {
            Text = contact.Email,
            X = Pos.Left(nameField),
            Y = Pos.Top(emailLabel),
            Width = Dim.Fill(2)
        };

        Label cityLabel = new() {
            Text = "Ciudad:",
            X = Pos.Left(nameLabel),
            Y = Pos.Bottom(emailLabel) + 1
        };
        cityField = new TextField {
            Text = contact.Ciudad,
            X = Pos.Left(nameField),
            Y = Pos.Top(cityLabel),
            Width = Dim.Fill(2)
        };

        Label birthDateLabel = new() {
            Text = "Nacimiento:",
            X = Pos.Left(nameLabel),
            Y = Pos.Bottom(cityLabel) + 1
        };
        birthDateField = new TextField {
            Text = contact.FechaNacimiento?.ToString("yyyy-MM-dd") ?? "",
            X = Pos.Left(nameField),
            Y = Pos.Top(birthDateLabel),
            Width = 12
        };

        favoriteField = new CheckBox {
            Text = "_Favorito",
            X = Pos.Left(nameField),
            Y = Pos.Bottom(birthDateLabel) + 1,
            Value = contact.Favorito ? CheckState.Checked : CheckState.UnChecked
        };

        Label notesLabel = new() {
            Text = "Notas:",
            X = Pos.Left(nameLabel),
            Y = Pos.Bottom(favoriteField) + 1
        };
        notesField = new TextView {
            Text = contact.Notas,
            X = Pos.Left(nameField),
            Y = Pos.Top(notesLabel),
            Width = Dim.Fill(2),
            Height = 5
        };

        Button saveButton = new() {
            Text = "Guardar",
            IsDefault = true,
            X = 20,
            Y = Pos.Bottom(notesField) + 1
        };
        saveButton.Accepting += (_, e) => {
            Save();
            e.Handled = true;
        };

        Button cancelButton = new() {
            Text = "Cancelar",
            X = Pos.Right(saveButton) + 2,
            Y = Pos.Top(saveButton)
        };
        cancelButton.Accepting += (_, e) => {
            App!.RequestStop();
            e.Handled = true;
        };

        Add(
            nameLabel, nameField,
            lastNameLabel, lastNameField,
            phoneLabel, phoneField,
            emailLabel, emailField,
            cityLabel, cityField,
            birthDateLabel, birthDateField,
            favoriteField,
            notesLabel, notesField
        );
        AddButton(saveButton);
        AddButton(cancelButton);

        nameField.SetFocus();
    }

    public bool Saved { get; private set; }
    public Contacto? Contact { get; private set; }

    private void Save() {
        string name = Clean(nameField.Text);
        string lastName = Clean(lastNameField.Text);

        if (string.IsNullOrWhiteSpace(name)) {
            MessageBox.Query(App!, "Validación", "El nombre es obligatorio.", "OK");
            nameField.SetFocus();
            return;
        }

        if (string.IsNullOrWhiteSpace(lastName)) {
            MessageBox.Query(App!, "Validación", "El apellido es obligatorio.", "OK");
            lastNameField.SetFocus();
            return;
        }

        DateOnly? birthDate = null;
        string birthDateText = Clean(birthDateField.Text);

        if (!string.IsNullOrWhiteSpace(birthDateText)) {
            if (!DateOnly.TryParseExact(
                birthDateText,
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out DateOnly parsedDate)) {
                MessageBox.Query(App!, "Validación", "La fecha debe tener formato yyyy-MM-dd o quedar vacía.", "OK");
                birthDateField.SetFocus();
                return;
            }

            birthDate = parsedDate;
        }

        Contact!.Nombre = name;
        Contact.Apellido = lastName;
        Contact.Telefono = Clean(phoneField.Text);
        Contact.Email = Clean(emailField.Text);
        Contact.Ciudad = Clean(cityField.Text);
        Contact.FechaNacimiento = birthDate;
        Contact.Favorito = favoriteField.Value == CheckState.Checked;
        Contact.Notas = Clean(notesField.Text);

        Saved = true;
        App!.RequestStop();
    }

    private static string Clean(object? value) {
        return value?.ToString()?.Trim() ?? "";
    }
}

public sealed class JsonAgendaStore {
    private static readonly JsonSerializerOptions JsonOptions = new() {
        WriteIndented = true
    };

    public JsonAgendaStore(string path) {
        Path = path;
    }

    public string Path { get; }

    public List<Contacto> Load() {
        if (!File.Exists(Path)) {
            return [];
        }

        string json = File.ReadAllText(Path, Encoding.UTF8);
        if (string.IsNullOrWhiteSpace(json)) {
            return [];
        }

        return JsonSerializer.Deserialize<List<Contacto>>(json, JsonOptions) ?? [];
    }

    public void Save(IEnumerable<Contacto> contacts) {
        string? directory = System.IO.Path.GetDirectoryName(Path);
        if (!string.IsNullOrWhiteSpace(directory)) {
            Directory.CreateDirectory(directory);
        }

        string json = JsonSerializer.Serialize(contacts.OrderBy(contact => contact.Id), JsonOptions);
        File.WriteAllText(Path, json, Encoding.UTF8);
    }
}

public sealed class Contacto {
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string Apellido { get; set; } = "";
    public string Telefono { get; set; } = "";
    public string Email { get; set; } = "";
    public string Ciudad { get; set; } = "";
    public DateOnly? FechaNacimiento { get; set; }
    public bool Favorito { get; set; }
    public string Notas { get; set; } = "";

    public string NombreLista => $"{Apellido}, {Nombre}";

    public Contacto Clone() {
        return new Contacto {
            Id = Id,
            Nombre = Nombre,
            Apellido = Apellido,
            Telefono = Telefono,
            Email = Email,
            Ciudad = Ciudad,
            FechaNacimiento = FechaNacimiento,
            Favorito = Favorito,
            Notas = Notas
        };
    }
}

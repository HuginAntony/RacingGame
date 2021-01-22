IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210122124215_DatabaseSetup')
BEGIN
    CREATE TABLE [Car] (
        [Id] int NOT NULL,
        [Name] varchar(50) NOT NULL,
        [Acceleration] int NOT NULL,
        [Braking] int NOT NULL,
        [CorneringAbility] int NOT NULL,
        [TopSpeed] int NOT NULL,
        CONSTRAINT [PK_Car] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210122124215_DatabaseSetup')
BEGIN
    CREATE TABLE [Track] (
        [Id] int NOT NULL,
        [Name] varchar(50) NULL,
        [TrackPath] varchar(4000) NOT NULL,
        CONSTRAINT [PK_Track] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210122124215_DatabaseSetup')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20210122124215_DatabaseSetup', N'5.0.2');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210122125528_AddSeedData')
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Acceleration', N'Braking', N'CorneringAbility', N'Name', N'TopSpeed') AND [object_id] = OBJECT_ID(N'[Car]'))
        SET IDENTITY_INSERT [Car] ON;
    EXEC(N'INSERT INTO [Car] ([Id], [Acceleration], [Braking], [CorneringAbility], [Name], [TopSpeed])
    VALUES (1, 8, 3, 4, ''CORV'', 9),
    (2, 6, 7, 9, ''GTR'', 8),
    (3, 7, 4, 4, ''MUSTANG'', 9)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Acceleration', N'Braking', N'CorneringAbility', N'Name', N'TopSpeed') AND [object_id] = OBJECT_ID(N'[Car]'))
        SET IDENTITY_INSERT [Car] OFF;
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210122125528_AddSeedData')
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name', N'TrackPath') AND [object_id] = OBJECT_ID(N'[Track]'))
        SET IDENTITY_INSERT [Track] ON;
    EXEC(N'INSERT INTO [Track] ([Id], [Name], [TrackPath])
    VALUES (1, ''Yas Marina'', ''11110011100011001110011101''),
    (2, ''Daytona'', ''11111111001111110111100001'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name', N'TrackPath') AND [object_id] = OBJECT_ID(N'[Track]'))
        SET IDENTITY_INSERT [Track] OFF;
END;
GO

IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20210122125528_AddSeedData')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20210122125528_AddSeedData', N'5.0.2');
END;
GO

COMMIT;
GO


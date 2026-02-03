const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (password !== confirmPassword) {
    setError('As senhas não coincidem.');
    return;
  }

  setIsSubmitting(true);

  try {
    // 1️⃣ cria usuário
    await supabase.auth.signUp({
      email,
      password
    });

    // 🔥 2️⃣ FAZ LOGIN (ESSENCIAL)
    await supabase.auth.signInWithPassword({
      email,
      password
    });

    // 3️⃣ cria tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .insert({ nome_empresa: name })
      .select()
      .single();

    // 4️⃣ agora metadata salva corretamente
    await supabase.auth.updateUser({
      data: {
        tenant_id: tenant.id,
        name
      }
    });

    // 5️⃣ profile
    await supabase.from('profiles').insert({
      id: tenant.id,
      name,
      email,
      role: 'operador',
      tenant_id: tenant.id
    });

    navigate('/dashboard');

  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};
